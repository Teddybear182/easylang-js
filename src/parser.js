import { Lexer } from './lexer.js';
export { Parser };

class Parser{
  tokens = [];

  generateAST(sourceCode){
    this.tokens = new Lexer().tokenize(sourceCode)
    let program = {type: 'Program', body: []};

    while (this.tokens[0].type != 'EOF'){
      let statement = this.parseStatement();
      program.body.push(statement);
    }

    console.log(program);
    return program;
  }

  expectToken(type, value=null, error){
    const tkn = this.tokens.shift();
    if (!tkn || tkn.type != type || tkn.value != value){
      throw new Error(`Parser error:\n ${error}, ${tkn}, Expecting -> type: ${type} value: ${value}`);
    }
    
    return tkn;
  }

  parseStatement(){
    return this.parseExpression();
  }

  parseExpression(){
    return this.parseAddExpr();
  }

  parseAddExpr(){
    let left = this.parseMultExpr();
    while(this.tokens[0].value == '+' || this.tokens[0].value == '-'){
      const operator = this.tokens.shift().value;
      const right = this.parseMultExpr();
      left = {type: 'BinaryExpr', left, right, operator };
    }

    return left;
  }

  parseMultExpr(){
    let left = this.parsePrimExpr();
    while(this.tokens[0].value == '*' || this.tokens[0].value == '/'){
      const operator = this.tokens.shift().value;
      const right = this.parsePrimExpr();
      left = {type: 'BinaryExpr', left, right, operator };
    }

    return left;
  }

  parsePrimExpr(){
    const token = this.tokens[0];
    if (token.type === 'identifier'){
      return {type: 'identifier', value: this.tokens.shift().value};
    }
    else if (token.type === 'number'){ 
      return {type: 'number', value: this.tokens.shift().value};
    }
    else if (token.type === 'parens' && token.value === '('){
      this.tokens.shift();
      let value = this.parseExpression();
      this.expectToken('parens', ')', 'Expected closed parenthesis');
      return value;
    }
    else {
      throw new Error(`Unexpected token: ${token}`);
    }
  }
}