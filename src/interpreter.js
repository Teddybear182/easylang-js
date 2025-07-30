import { makeNull, makeNumber, makeString, makeIdentifier } from "./utils.js";

export function evaluate(statement, env){
  if(statement.type == 'number'){
    return makeNumber(statement.value);
  }
  if(statement.type == 'string'){
    return makeString(statement.value);
  }
  else if(statement.type == 'identifier'){
    return evaluateIdentifier(statement, env);
  }
  else if(statement.type == 'null'){
    return makeNull();
  }
  else if(statement.type == 'varDec'){
    return evaluateVarDeclaration(statement, env);
  }
  else if(statement.type == 'BinaryExpr'){
    return evaluateBinEx(statement, env);
  }
  else if(statement.type == 'UnaryExpr'){
    return evaluateUnaryEx(statement, env);
  }
  else if(statement.type == 'Assignment'){
    return evaluateAssignment(statement, env);
  }
  else if(statement.type == 'ArrayExpr'){
    return evaluateArrayExpr(statement, env);
  }
  else if(statement.type == 'ObjectExpr'){
    return evaluateObjectExpr(statement, env);
  }
  else if(statement.type == 'Program'){
    return evaluateProgram(statement, env);
  }
  else{
    throw new Error('Unrecognized statement: ' + JSON.stringify(statement));
  }
}

function evaluateProgram(program, env){
  let evaluated = makeNull();
  for(const statement of program.body){
    evaluated = evaluate(statement, env);
  }
  return evaluated;
}

function evaluateVarDeclaration(varDec, env){
  let value;
  value = evaluate(varDec.initVal, env);
  let name = varDec.varName;
  return env.declare(name, value, varDec.isConstant);
}

function evaluateAssignment(assignment, env){
  let varName = assignment.left;
  let right = evaluate(assignment.right, env);
  return env.assign(varName, right);
}

function evaluateObjectExpr(object, env){
  const properties = new Map();
  let obj = {type: 'object', properties};

  for(let prop of object.properties){
    let value = prop.value;
    let name = prop.key;
    if(value != undefined){
      value = evaluate(value, env);
    }
    else{
      value = env.getValue(name);
    }
    properties.set(name, value);
  }

  return obj;
}

function evaluateArrayExpr(array, env){
  const properties = [];
  let arr = {type: 'array', properties};

  for(let element of array.properties){
    const value = evaluate(element.value, env);
    properties.push(value);
  }
  return arr;
}

function evaluateIdentifier(id, env){
  const value = env.getValue(String(id.value));
  return value;
}

const UnaryOperations = {
  "-": a => -a,
  "not": (a) => Number(!Boolean(a)),
};

function evaluateUnaryEx(UnaryOp, env){
  const expr = evaluate(UnaryOp.expression, env)
  return makeNumber(UnaryOperations[UnaryOp.operator](expr.value));
}

const BinaryOperations = {
  "+": (a,b) => a+b,
  "-": (a,b) => a-b,
  "*": (a,b) => a*b,
  "/": (a,b) => a/b,
  "%": (a,b) => a%b,
};

function evaluateBinEx(BinOp, env){
  let lhs = evaluate(BinOp.left, env);
  let rhs = evaluate(BinOp.right, env);
  if (lhs.type == 'number' && rhs.type == 'number'){
    return evaluateNumBinEx(lhs, rhs, BinOp.operator);
  }
  return makeNull();
}

function evaluateNumBinEx(lhs, rhs, operator){
  let left = parseFloat(lhs.value);
  let right = parseFloat(rhs.value);
  let result = 0;
  if (BinaryOperations[operator] != undefined){
    result = BinaryOperations[operator](left, right);
  }
  else{
    throw new Error(`Unidentified operator: ${operator}`);
  }
  return makeNumber(result);
}

