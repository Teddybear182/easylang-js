const Keywords = [
  'var', 'const', 'if', 'else', 'loop', 'for', 'task', 'return', 'true', 'false'
];

const Operators = [
  '\\+', '\\-', '/', '\\*', '%', '==', '>=', '<=', '<', '>', '!=', '=', 'or', 'and'
];

const regex = {
  number: /^\d+(\.\d+)?\b/,
  string: /^"([^"]*)"/,
  identifier: /^[a-zA-Z_]+([0-9a-zA-Z_]+)?/,

  parens: /^[()]/,
  operators: new RegExp(`^(${Operators.join('|')})`),
  keywords: new RegExp(`^(${Keywords.join('|')})`),
  punctuation: /^[{}[\];:,.]/,

  space: /^( )/,
  multispaces: /[\s\t]{2,}/,
  nextline: /\n+/,
};

export class Lexer{
  tokenize(sourceCode){
    let code = sourceCode;
    let tokens = [];
    let i=0;
    while(code.length !== 0){
      let match;
      code = code.replace(regex.multispaces, ' ');
      code = code.replace(regex.nextline, ' ');
      if (match = code.match(regex.number)){
        tokens.push({type: 'number', value: parseFloat(match[0])});
      }
      else if (match = code.match(regex.keywords)){
        tokens.push({type: 'keyword', value: match[0]});
      }
      else if (match = code.match(regex.punctuation)){
        tokens.push({type: 'punctuation', value: match[0]});
      }
      else if (match = code.match(regex.string)){
        tokens.push({type: 'string', value: match[1]});
      }
      else if (match = code.match(regex.identifier)){
        tokens.push({type: 'identifier', value: match[0]});
      }
      else if (match = code.match(regex.parens)){
        tokens.push({type: 'parens', value: match[0]});
      }
      else if (match = code.match(regex.operators)){
        tokens.push({type: 'operator', value: match[0]});
      }
      else if (match = code.match(regex.space)){
        code = code.slice(1);
        continue;
      }
      else {
        throw new Error(`Something went wrong: ${code[0]}`);
      }
      //console.log(code, match[0]);
      console.log(`added token -> type: ${tokens[i].type}, value: ${tokens[i].value}`);
      i++;
      code = code.slice(match[0].length);
    }
    console.log(`tokens: ${JSON.stringify(tokens)}`);
    tokens.push({type: 'EOF', value: 'EndOfFile'});
    return tokens;
  }
}