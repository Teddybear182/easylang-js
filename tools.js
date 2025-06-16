class Lexer{
  constructor(code){
    this.code = code;
    this.tokens = [];
    this.currChar = this.code[this.pos];
    this.regex = {
      string: /^"([^"]*)"/,
      number: /^\d+(\.\d+)?\b/,
      id: /^[_a-zA-Z0-9]+/,
      parens: /^[()]/,
      whitespace: /\s/
    }
  }

  tokenize(){
    let i=0;
    while(this.code.length !== 0){
      let match;
      this.code = this.code.replace(this.regex.whitespace, '');
      if (match = this.code.match(this.regex.number)){
        this.tokens.push({type: 'number', value: parseInt(match[0])});
      }
      else if (match = this.code.match(this.regex.string)){
        this.tokens.push({type: 'string', value: match[1]});
      }
      else if (match = this.code.match(this.regex.id)){
        this.tokens.push({type: 'id', value: match[0]});
      }
      else if (match = this.code.match(this.regex.parens)){
        this.tokens.push({type: 'parens', value: match[0]});
      }
      else {
        throw new SyntaxError(`Something went wrong: ${this.code}`);
      }
      console.log(`type: ${this.tokens[i].type}, value: ${this.tokens[i].value}`);
      i++;
      this.code = this.code.slice(match[0].length);
    }
    return this.tokens;
  }
}

code = 'write "ggg" 8899 ()';
let lexer = new Lexer(code);
lexer.tokenize();