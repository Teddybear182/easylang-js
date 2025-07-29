import { evaluate } from "./interpreter.js";
import { Environment } from "./env.js";
import { Parser } from "./parser.js";
import { configScope } from "./env.js";


let codeArea = document.getElementById("codeArea");
let output = document.getElementById("output");
let runButton = document.getElementById("runButton");
let lineCounter = document.getElementById("lineCounter");
let loadFile = document.getElementById("loadFile");
let saveFile = document.getElementById("saveFile");
let fileInput = document.getElementById("fileInput");

runButton.addEventListener('click', runCode);

output.value = 'EasyLang v0.3';

function runCode(){
  try{
    let code = codeArea.value;
    let ast = new Parser().generateAST(code);
    let globalEnvironment = new Environment();
    configScope(globalEnvironment);

    let out = evaluate(ast, globalEnvironment);
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

loadFile.addEventListener('click', () => {
  fileInput.click();
});

saveFile.addEventListener('click', () => {
  const blob = new Blob([codeArea.value], {type: '.easyl'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = prompt('Enter the name of your project', Math.random().toString(16).slice(2)) + '.easyl';
  if(link.download == undefined){
    return;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

fileInput.addEventListener('change', () =>{
  const file = fileInput.files[0];
  if(!file) return;
  const fileReader = new FileReader();
  fileReader.onload = () => {
    codeArea.value = fileReader.result;
  };
  fileReader.readAsText(file);
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