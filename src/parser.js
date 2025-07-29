import { Lexer } from './lexer.js';
import { makeNull, makeNumber } from "./utils.js";

export class Parser{
  tokens = [];
  
  next(){
    return this.tokens.shift();
  }

  check(){
    return this.tokens[0];
  }

  checkType(){
    return this.check()?.type;
  }

  checkValue(){
    return this.check()?.value;
  }

  expect(type, value, error){
    const tkn = this.next();
    if (!tkn || tkn.type != type || tkn.value != value){
      throw new Error(`Parser error:\n ${error}, ${JSON.stringify(tkn)}, Expecting -> {type: ${type} , value: ${value} }`);
    }
    return tkn;
  }

  checkIf(value){
    if (this.checkValue() === value){
      this.next();
      return true;
    }
    return false;
  }

  generateAST(sourceCode){
    this.tokens = new Lexer().tokenize(sourceCode)
    let program = {type: 'Program', body: []};

    while (this.checkType() != 'EOF'){
      let statement = this.parseStatement();
      program.body.push(statement);
    }

    console.log(program);
    return program;
  }

  parseStatement(){
    switch(this.checkValue()){
      case 'var':
      case 'const':
        return this.parseVarDec();
      case 'task':
        return this.parseFunction();
    }
    return this.parseExpression();
  }

  parseVarDec(){
    let isConstant = false;
    if(this.next().value == 'const'){
      isConstant = true;
    }
    if(this.checkType() != 'identifier'){
      throw new Error(`Expected name of the variable instead of ${this.check()}`);
    }
    let varName = this.next().value;
    let initVal = makeNull();
    if(this.checkIf('=')){
      initVal = this.parseExpression();
    }
    return {type: 'varDec', varName, initVal, isConstant};
  }

  parseFunction(){
    this.next();
    if(this.checkType() != 'identifier'){
      throw new Error(`Expected name of the function instead of ${this.check()}`);
    }
    let funcName = this.next().value;
    let args = this.parseArgs();
    let params = [];

    for(const arg of args){
      if(arg.type != 'identifier'){
        throw new Error(`Expected parameters to be of type identifier inside a function declaration`);
      }
      params.push(arg.value);
    }

    this.expect('punctuation', '{', 'Expected function body after declaration');
    let body = [];

    while(this.checkType()!='EOF' && this.checkValue()!='}'){
      body.push(this.parseStatement());
    }

    this.expect('punctuation', '}', 'Expected closing brace after function body');

    const func = {
      type: 'FunctionDec',
      funcName,
      parameters: params,
      body
    }

    return func;
  }



  parseArgs(){
    this.expect('parens', '(', 'Expected opened parenthesis');
    let result;
    if(this.checkValue() == ')'){
      result = [];
    }
    else{
      result = this.parseArgsList();
    }
    this.expect('parens', ')', 'Expected closed parenthesis');
    return result;
  }

  parseArgsList(){
    let args = [this.parseExpression()];
    while(this.checkValue() == ','){
      this.next();
      args.push(this.parseExpression());
    }
    return args;
  }

  parseExpression(){
    let result = this.parseObjectExpr();

    if(this.checkIf('=')){ //check for assign expression
      if(result.type != 'identifier'){
        throw new Error(`Expected an identifier in assignment instead of ${result.type}`);
      }
      let right = this.parseExpression();
      return result = {
        type: 'Assignment',
        left: result.value,
        right
      };
    }

    return result;
  }

  //{a:10, b:5}
  parseObjectExpr(){
    if(this.checkValue() != '{'){
      return this.parseAddExpr();
    }
    this.next();
    const properties = [];

    while(this.checkType() != 'EOF' && this.checkValue() != '}'){

      if(this.checkType()!='identifier'){
        throw new Error(`Expected identifier as a key instead of ${JSON.stringify(this.check())}`);
      }
      const key = this.next().value;

      if(this.checkIf(',')){
        properties.push({type: 'Property', key});
      }
      else if(this.checkValue()=='}'){
        properties.push({type: 'Property', key});
      }

      else if(this.checkIf(':')){
        const value = this.parseExpression();
        properties.push({type: 'Property', key, value})
        if(this.checkValue()!='}'){
          this.expect('punctuation', ',', 'Expected comma after defining property');
        }
      }
    }

    this.expect('punctuation', '}', 'Expected closed bracket after defining object');
    return {type: 'ObjectExpr', properties};
  }


  parseAddExpr(){
    let left = this.parseMultExpr();
    while(this.checkValue() == '+' || this.checkValue() == '-'){
      const operator = this.next().value;
      const right = this.parseMultExpr();
      left = {type: 'BinaryExpr', left, right, operator };
    }
    return left;
  }

  /*  5+2*4 --> [5, [ 2, 4, *], +] --- something like that */
  parseMultExpr(){
    let left = this.parsePrimExpr();
    while(this.checkValue() == '*' || this.checkValue() == '/' || this.checkValue() == '%'){
      const operator = this.next().value;
      const right = this.parsePrimExpr();
      left = {type: 'BinaryExpr', left, right, operator };
    }
    return left;
  }

  parsePrimExpr(){
    const token = this.check();

    if (token.type == 'identifier'){
      const tkn = this.next();
      return {type: 'identifier', value: tkn.value};
    }

    else if (token.type == 'number'){
      const tkn = this.next();
      return makeNumber(tkn.value);
    }

    else if (token.type == 'parens' && token.value == '('){
      this.next();
      let value = this.parseExpression();
      this.expect('parens', ')', 'Expected closed parenthesis');
      return value;
    }

    else if (this.checkIf('-')){
      return {type: 'UnaryExpr', operator: '-', expression: this.parsePrimExpr()};
    }

    else {
      throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
    }
  }
}