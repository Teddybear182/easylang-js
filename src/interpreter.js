import { makeNull, makeNumber } from "./utils.js";

export function evaluate(statement, env){
  if(statement.type == 'number'){
    return makeNumber(statement.value);
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

function evaluateIdentifier(id, env){
  const value = env.getValue(String(id.value));
  return value;
}

function evaluateVarDeclaration(varDec, env){
  let value;
  value = evaluate(varDec.initVal, env);
  let name = varDec.varName;
  return env.declare(name, value);
}

function evaluateBinEx(BinOp, env){
  let lhs = evaluate(BinOp.left, env);
  let rhs = evaluate(BinOp.right, env);
  if (lhs.type == 'number' && rhs.type == 'number'){
    return evaluateNumBinEx(lhs, rhs, BinOp.operator)
  }
  else if (lhs.type == 'identifier' || rhs.type == 'identifier'){
    lhs = evaluateIdentifier(lhs, env);
    lhs = evaluateIdentifier(rhs, env);
    console.log(lhs, rhs);
    return evaluateNumBinEx(lhs, rhs, BinOp.operator);
  }
  return makeNull();
}

const BinaryOperations = {
  "+": (a,b) => a+b,
  "-": (a,b) => a-b,
  "*": (a,b) => a*b,
  "/": (a,b) => a/b,
  "%": (a,b) => a%b,
};


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

