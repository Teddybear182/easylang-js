import { Lexer } from './lexer.js';
import { makeNull, makeNumber, makeString, makeIdentifier } from "./utils.js";

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
      case 'if':
        return this.parseIf();
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

    this.expect('punctuation', ';', 'Expected semicolon after initializing variable');
    return {type: 'varDec', varName, initVal, isConstant};
  }

  parseIf(){
    this.next();
    let body = [];
    let condition;
    let elseBody = [];

    this.expect('parens','(',`Expected condition after the keyword 'if'`);
    condition = this.parseExpression();
    this.expect('parens',')',`Expected closed paren after condition`);

    this.expect('punctuation','{',`Expected body after condition`);
    while(this.checkType()!='EOF' && this.checkValue()!='}'){
      body.push(this.parseStatement());
    }
    this.expect('punctuation','}',`Expected closed brace after body`);

    if(this.checkValue()=='else'){
      this.next();
      this.expect('punctuation','{',`Expected body after else`);
      while(this.checkType()!='EOF' && this.checkValue()!='}'){
        elseBody.push(this.parseStatement());
      }
      this.expect('punctuation','}',`Expected closed brace after body`);
    }
    return {
      type: 'ifCondition',
      condition,
      body,
      elseBody
    }
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
      type: 'functionDec',
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
    let result = this.parseArrayExpr();

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
  
  parseArrayExpr(){
    if(this.checkValue() != '['){
      return this.parseObjectExpr();
    }
    this.next();
    const properties = [];

    while(this.checkType()!='EOF' && this.checkValue()!=']'){

      if(this.checkType()!='identifier' && this.checkType()!='number' && this.checkType()!='string'){
        throw new Error(`Expected valid token type in array expression instead of ${this.checkType()}`);
      }
      const value = this.parseExpression();

      if(this.checkIf(',')){
        properties.push({type: 'Element', value});
      }
      else if(this.checkValue()==']'){
        properties.push({type: 'Element', value});
      }
    }
    this.expect('punctuation', ']', 'Expected closed brace after defining array');
    return {type: 'ArrayExpr', properties};
  }

  //{a:10, b:5}
  parseObjectExpr(){
    if(this.checkValue() != '{'){
      return this.parseOrExpr();
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

  parseOrExpr(){
    return (
      this.parseBinaryExprWith(['or'], () =>
      this.parseBinaryExprWith(['and'], () =>
      this.parseBinaryExprWith(['!=', '=='], () =>
      this.parseBinaryExprWith(['<', '>', '<=', '>='], () =>
      this.parseBinaryExprWith(['+', '-'], () =>
      this.parseBinaryExprWith(['*', '/', '%'], () =>
      this.parseCallExpr()))))))
    );
  }
  
  //object["a"]()
  parseCallExpr(){
    let caller = this.parseMemberExpr();

    if(this.checkValue()!='('){
      return caller;
    }

    let callExpr = caller;
    while(this.checkValue()=='('){
      callExpr = {
        type: 'CallExpr',
        caller: callExpr,
        args: this.parseArgs()
      }
    }

    return callExpr;
  }

  parseMemberExpr(){
    let obj = this.parsePrimExpr();

    while(this.checkValue()=='[' || this.checkValue()=='.'){
      const operator = this.next();
      let prop;
      let computed;

      if(operator.value=='.'){
        computed = false;
        prop = this.parsePrimExpr();
        if(prop.type != 'identifier'){
          throw new Error(`Expected identifier type at member expression instead of "${prop.type}"`);
        }
      }
      else if(operator.value=='['){
        computed = true;
        prop = this.parseExpression();
        this.expect('punctuation', ']', 'Missing closed bracket after defining computed property')
      }

      obj = {
        type: 'MemberExpr',
        object: obj,
        prop,
        computed
      }
    }

    return obj
  }

  parseBinaryExprWith(operators, nextfunc){
    let left = nextfunc();
    let operator;
    while(operators.includes(operator = this.checkValue())){
      this.next();
      let right = nextfunc();
      left = {
        type: 'BinaryExpr',
        left,
        right,
        operator
      };
    }
    return left;
  }

  parsePrimExpr(){
    const token = this.check();

    if (token.type == 'identifier'){
      const tkn = this.next();
      return makeIdentifier(tkn.value);
    }

    if (token.type == 'string'){
      const tkn = this.next();
      return makeString(tkn.value);
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