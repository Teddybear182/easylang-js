import { makeNull, makeNumber, makeString, makeNativeFunction, makeObject, makeArray } from "./utils.js";
import { writeln } from "./index.js";

export class Environment{
  parent;
  variables = new Map();
  constants = new Set();

  constructor(parent){
    this.parent = parent;
  }

  isDeclared(varName){
    if (this.parent?.isDeclared(varName)){
      return true;
    }
    return this.variables.has(varName);
  }

  declare(varName, value, isConstant){
    console.log(this.variables);
    
    if (this.isDeclared(varName)){
      throw new Error(`Can't declare variable "${varName}", it's already initialized`);
    }

    if(isConstant){
      this.constants.add(varName)
    }
    this.variables.set(varName, value);

    return value;
  }

  assign(varName, value){
    const environment = this.locateVariable(varName);
    if(this.constants.has(varName)){
      throw new Error(`Cannot assign new value to the constant`);
    }
    environment.variables.set(varName, value);
    return value;
  }

  locateVariable(varName){
    if (this.variables.has(varName)){
      return this;
    }
    if (this.parent == undefined){
      throw new Error(`Can't find an environment where "${varName}" was initialized`)
    }

    return this.parent.locateVariable(varName);
  }

  getValue(varName){
    let environment = this.locateVariable(varName);
    return environment.variables.get(varName);
  }
}

export function configureScope(scope){
  scope.declare("null", makeNull(), true);
  scope.declare("true", makeNumber(1), true);
  scope.declare("false", makeNumber(0), true);
  scope.declare("write", makeNativeFunction((args, env)=>{
    console.log(...args); 
    writeln(...args)
  }), true);
  scope.declare("input", makeNativeFunction((args, env)=>{
    const input = prompt(args[0].value);
    return makeString(input);
  }), true);
  scope.declare("toString", makeNativeFunction((args, env)=>{return makeString(String(args[0].value))}), true);
  scope.declare("int", makeNativeFunction((args, env)=>{return makeNumber(parseInt(args[0].value))}), true);
  scope.declare("math", makeObject([
    {key: 'Pi', value: makeNumber(Math.PI)},
    {key: 'sqrt', value: makeNativeFunction((args,env)=>{
      return makeNumber(Math.sqrt(args[0].value))
    })},
    {key: 'round', value: makeNativeFunction((args,env)=>{
      return makeNumber(Math.round(parseFloat(args[0].value)))
    })},
    {key: 'cos', value: makeNativeFunction((args,env)=>{
      return makeNumber(Math.cos(parseFloat(args[0].value)))
    })},
    {key: 'sin', value: makeNativeFunction((args,env)=>{
      return makeNumber(Math.sin(parseFloat(args[0].value)))
    })},
    {key: 'random', value: makeNativeFunction((args, env)=>{
      const min = parseInt(args[0].value);
      const max =  parseInt(args[1].value);
      const value = Math.floor(Math.random()*(max-min) + min);
      return makeNumber(value);
    })},
  ]));
  scope.declare("string", makeObject([
    {key: 'split', value: makeNativeFunction((args,env)=>{
      const arg1 = String(args[0].value);
      const arg2 = String(args[1].value);
      return makeArray(arg1.split(arg2))
    })},
    {key: 'len', value: makeNativeFunction((args,env)=>{
      return makeNumber(String(args[0].value).length)
    })},
    {key: 'matches', value: makeNativeFunction((args,env)=>{
      const arg1 = String(args[0].value);
      const arg2 = String(args[1].value);
      const match = arg1.match(new RegExp(arg2));
      if(match){
        return makeString(match[0]);
      }
      return makeString('null');
    })},
    {key: 'replace', value: makeNativeFunction((args,env)=>{
      return makeString(String(args[0].value).replaceAll(String(args[1].value), String(args[2].value)))
    })},
  ]));
}
