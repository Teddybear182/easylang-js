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
        return this.parseVarDec();
    }
    return this.parseExpression();
  }

  parseVarDec(){
    this.next();
    if(this.checkType() != 'identifier'){
      throw new Error(`Expected name of the variable instead of ${this.check()}`);
    }
    let varName = this.next().value;
    let initVal = makeNull();
    if(this.checkIf('=')){
      initVal = this.parseExpression();
    }
    else{
      this.expect('punctuation', ';', 'Expected semicolon at the end of expression');
    }
    return {type: 'varDec', varName, initVal};
  }


  parseExpression(){
    return this.parseAddExpr();
  }

  parseAddExpr(){
    let left = this.parseMultExpr();
    while(this.checkValue() == '+' || this.checkValue() == '-'){
      const operator = this.next().value;
      const right = this.parseMultExpr();
      left = {type: 'BinaryExpr', left, right, operator };
    }
    this.expect('punctuation', ';', 'Expected semicolon at the end of expression');
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

    else {
      throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
    }
  }
}