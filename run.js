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

window.runCode = runCode;