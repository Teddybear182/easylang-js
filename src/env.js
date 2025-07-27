import { makeNull } from "./utils.js";

export class Environment{
  parent;
  variables = new Map();

  constructor(parent){
    this.parent = parent;
  }

  isDeclared(varName){
    if (this.parent?.isDeclared(varName)){
      return true;
    }
    return this.variables.has(varName);
  }

  declare(varName, value){
    if (this.isDeclared(varName)){
      throw new Error(`Can't declare variable "${varName}", it's already initialized`);
    }

    this.variables.set(varName, value);
    return value;
  }

  assign(varName, value){
    const environment = this.locateVariable(varName);
    environment.variables.set(varName, value);
    return value;
  }

  locateVariable(varName){
    console.log(this.variables);
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