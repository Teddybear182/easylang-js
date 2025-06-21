import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";

let codeArea = document.getElementById("codeArea");
let output = document.getElementById("output");

function runCode(){
  let code = codeArea.value;
  let lexer = new Lexer(code);
  let tokens = lexer.tokenize();
  let parser = new Parser(tokens);
  output.value = parser.result;
  console.log(parser.result);
}

codeArea.addEventListener('keydown', function(e) {
  if (e.key == 'Tab'){
    e.preventDefault();
    let start = this.selectionStart;
    let end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 1;
  }
})

window.runCode = runCode;