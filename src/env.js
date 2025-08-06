import { makeNull, makeNumber } from "./utils.js";
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

export function configScope(scope){
  scope.declare("Pi", makeNumber(Math.PI), true);
  scope.declare("null", makeNull(), true);
  scope.declare("write", {type: 'nativeFunction', call: (args, env)=>{console.log(...args); writeln(...args)}}, true);
}
