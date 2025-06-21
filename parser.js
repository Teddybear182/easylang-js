export {Parser};

class Parser{
  result = '';
  tokens = [];
  pos = 0;

  builtIn = {
    'write': (str) => `${str}`,
    'return': (val) => val,
    'add': (val1, val2) => (parseInt(val1))+(parseInt(val2)),
    'subtract': (val1, val2) => (parseInt(val1))-(parseInt(val2)),
    'multiply': (val1, val2) => (parseInt(val1))*(parseInt(val2)),
    'divide': (val1, val2) => (parseInt(val1))/(parseInt(val2)),
    'sqrt': (val) => Math.sqrt(val),
    'pi': () => Math.PI,
    'var': (name, value) => this.variables[name] = value,
  }

  functions = {};
  variables = {};

  constructor(tokens){
    this.tokens = tokens;
    this.parse();
  }

  parse(){
    while (this.pos < this.tokens.length){
      this.result += String(this.parseToken());
      console.log(`vars: ${JSON.stringify(this.variables)}`);
      console.log(`funcs: ${JSON.stringify(this.functions)}`);
      this.pos++;
    }
  }

  parseToken(){
    const token = this.tokens[this.pos];
    
  }

  handleFunctions(){

  }
}