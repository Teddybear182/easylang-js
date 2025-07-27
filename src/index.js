import { evaluate } from "./interpreter.js";
import { Environment } from "./env.js";
import { Parser } from "./parser.js";
import { makeNull, makeNumber } from "./utils.js";


let codeArea = document.getElementById("codeArea");
let output = document.getElementById("output");
let runButton = document.getElementById("runButton");
let lineCounter = document.getElementById("lineCounter");

runButton.addEventListener('click', runCode);

output.value = 'EasyLang v0.1';

function runCode(){
  try{
    let code = codeArea.value;
    let ast = new Parser().generateAST(code);
    let environment = new Environment();

    environment.declare("Pi", makeNumber(Math.PI));
    environment.declare("null", makeNull());

    let out = evaluate(ast, environment);

    output.value += `\n>${out.value}`;
    console.log(out)
  } catch(e){
    output.value += `\n>[ERROR] ${e}`;
    console.log(e);
  }
}

codeArea.addEventListener('keydown', function(e) {
  if (e.key == 'Tab'){
    e.preventDefault();
    let start = this.selectionStart;
    let end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 1;
  }
});

function UpdateLineCounter(){
  const lines = codeArea.value.split('\n');
  const counter = Array.from({length: lines.length}, (_, i) => i+1);
  lineCounter.innerHTML = '';
  for(let number of counter){
    const lineNumber = document.createElement('div');
    lineNumber.textContent = number + '.';
    lineNumber.style.height = codeArea.scrollHeight / lines + 'px';
    lineNumber.id = 'lineNumber'
    lineCounter.appendChild(lineNumber);
  }
  lineCounter.scrollTop = codeArea.scrollTop;
}

codeArea.addEventListener('input', UpdateLineCounter);
codeArea.addEventListener('scroll', () => {
  lineCounter.scrollTop = codeArea.scrollTop;
});