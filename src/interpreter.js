import { makeNull, makeNumber, makeString, makeIdentifier } from "./utils.js";
import { Environment } from "./env.js";

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
  else if(statement.type == 'functionDec'){
    return evaluateFunDec(statement, env);
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
  else if(statement.type == 'MemberExpr'){
    return evaluateMemberExpr(statement, env);
  }
  else if(statement.type == 'CallExpr'){
    return evaluateCallExpr(statement, env);
  }
  else if(statement.type == 'Program'){
    return evaluateProgram(statement, env);
  }
  else if(statement.type == 'ifCondition'){
    return evaluateIf(statement, env);
  }
  else if(statement.type == 'Loop'){
    return evaluateLoop(statement, env);
  }
  else if(statement.type == 'WhileLoop'){
    return evaluateWhileLoop(statement, env);
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

function evaluateFunDec(func, env){
  const name = func.funcName;
  const params = func.parameters;
  const body = func.body;

  const result = {
    type: "function",
    name,
    parameters: params,
    env,
    body,
  };

  return env.declare(name, result, true);
}

function evaluateLoop(loop, env){
  const amount = evaluate(loop.amount, env).value;
  const varName = loop.variable.value;
  let result = [];
  
  for(let j=0; j<amount; j++){
    let scope = new Environment(env);
    scope.declare(varName, j, false);
    for(const statement of loop.body){
      result.push(evaluate(statement,scope));
    }
  }
  return result;
}


function evaluateWhileLoop(loop, env){
  let condition = evaluate(loop.condition, env);
  let result = [];

  while(condition!=null&&condition!=0&&condition!='null'){
    let scope = new Environment(env);
    for(const statement of loop.body){
      result.push(evaluate(statement,scope));
      condition = evaluate(loop.condition, env).value;
    }
  }
  return result;
}


function evaluateIf(statement, env){
  let condition = evaluate(statement.condition, env).value;
  let result = [];
  const scope = new Environment(env);
  console.log("CONDITION: ",condition);
  if(condition!=null && condition!=0 && condition!='null'){
    for(const x of statement.body){
      condition = evaluate(statement.condition, env).value;
      console.log("CONDITION: ",condition);
      result.push(evaluate(x,scope));
    }
  }
  else{
    for(const x of statement.elseBody){
      result.push(evaluate(x,scope));
    }
  }
  return result;
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

function evaluateMemberExpr(member, env){
  let obj = evaluate(member.object, env);

  if(obj.type=='function'){
    return obj.env.getValue(member.prop.value)
  }

  let properties = obj.properties;
  let property;
  if(member.computed){
    property = evaluate(member.prop, env).value;
  } 
  else{
    property = member.prop.value;
  }

  let result;
  if(Array.isArray(properties)){
    if(member.computed==false){
      throw new Error(`Cannot access value of array through not computed member expression`)
    }
    if(property<0||property>properties.length){
      throw new Error(`Expected valid index number instead of ${property}`)
    }
    result = properties.at(property);
  }
  else{
    result = properties.get(property);
  }

  return result;
}

function evaluateCallExpr(callExpr, env){
  let args = callExpr.args.map((arg) => evaluate(arg, env));
  let func = evaluate(callExpr.caller, env);
  if(func.type != 'function' && func.type != 'nativeFunction'){
    throw new Error(`Expected function type instead of ${func.type} in call expression!`);
  }

  if(func.type == 'nativeFunction'){
    return func.call(args, env);
  }

  if(args.length<func.parameters.length || args.length>func.parameters.length){
    throw new Error(`The amount of args in call and in fucntion declaration must be the same`);
  }

  const scope = new Environment(func.env);
  for(let i = 0; i<func.parameters.length; i++){
    const varName = func.parameters[i];
    scope.declare(varName, args[i], false);
  }

  const properties = [];
  let result = {type: 'function', properties, env:scope};
  for(const statement of func.body){
    const prop = evaluate(statement, scope);
    properties.push(prop);
  }
  return result;
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
  const value = env.getValue(id.value);
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
  "<": (a,b) => Number(a<b),
  "<=": (a,b) => Number(a<=b),
  ">": (a,b) => Number(a>b),
  ">=": (a,b) => Number(a>=b),
  "and": (a,b) => Number(a&&b),
  "or": (a,b) => Number(a||b),
  "!=": (a,b) => Number(a!=b),
  "==": (a,b) => Number(a==b),
};

function evaluateBinEx(BinOp, env){
  let lhs = evaluate(BinOp.left, env);
  let rhs = evaluate(BinOp.right, env);
  console.log("LHS: ", lhs, "RHS: ", rhs);
  if (lhs.type == 'number' && rhs.type == 'number'){
    return evaluateNumBinEx(lhs, rhs, BinOp.operator);
  }
  return makeNull();
}

function evaluateNumBinEx(lhs, rhs, operator){
  let left = parseFloat(lhs.value);
  let right = parseFloat(rhs.value);
  let result = 0;
  console.log("LHS: ", lhs, "RHS: ", rhs);
  if (BinaryOperations[operator] != undefined){
    result = BinaryOperations[operator](left, right);
  }
  else{
    throw new Error(`Unidentified operator: ${operator}`);
  }
  return makeNumber(result);
}

