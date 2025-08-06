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

function evaluateIf(statement, env){
  let condition = evaluate(statement.condition, env).value;
  let result = [];
  if(condition!=null&&condition!=0&&condition!='null'){
    console.log(condition);
    for(const x of statement.body){
      result.push(evaluate(x,env));
    }
  }
  else{
    for(const x of statement.elseBody){
      result.push(evaluate(x,env));
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
    let property = member.prop.value
    return obj.env.getValue(property);
  }

  obj = obj.properties;

  let property;
  if(member.computed){
    property = evaluate(member.prop, env).value;
  } 
  else{
    property = member.prop.value;
  }

  let result;
  if(Array.isArray(obj)){
    if(member.computed=false){
      throw new Error(`Cannot access value of array through not computed member expression`)
    }
    if(property<0||property>obj.length){
      throw new Error(`Expected valid index number instead of ${property}`)
    }
    result = obj.at(property);
  }
  else{
    result = obj.get(property);
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

  let result = {type: 'function', body: [], env: scope};
  console.log(func.body);
  for(const statement of func.body){
    result.body.push(evaluate(statement, scope));
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

