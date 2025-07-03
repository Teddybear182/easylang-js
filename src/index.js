import { evaluate } from "./interpreter.js";
import { Parser } from "./parser.js";


let codeArea = document.getElementById("codeArea");
let output = document.getElementById("output");
let runButton = document.getElementById("runButton");

runButton.addEventListener('click', runCode);

output.value = 'EasyLang v0.1';
function runCode(){
  let code = codeArea.value;
  let ast = new Parser().generateAST(code);
  let out = evaluate(ast);
  output.value += `\n>${out.value}`;
  console.log(out)
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