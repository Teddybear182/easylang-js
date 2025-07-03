export function evaluate(statement){
  if(statement.type == 'number'){
    return {type: 'number', value: statement.value};
  }
  else if(statement.type == 'null'){
    return {type: 'null', value: 'null'};
  }
  else if(statement.type == 'BinaryExpr'){
    return evaluateBinEx(statement);
  }
  else if(statement.type == 'Program'){
    return evaluateProgram(statement);
  }
  else{
    throw new Error(`Unrecognized statement: ${statement}`);
  }
}

function evaluateProgram(program){
  let evaluated = {type: 'null', value: 'null'};
  for(const statement of program.body){
    evaluated = evaluate(statement);
  }
  return evaluated;
}

function evaluateBinEx(BinOp){
  let lhs = evaluate(BinOp.left);
  let rhs = evaluate(BinOp.right);
  if (lhs.type == 'number' && rhs.type == 'number'){
    return evaluateNumBinEx(lhs, rhs, BinOp.operator)
  }
  return {type: 'null', value: 'null'};
}

function evaluateNumBinEx(lhs, rhs, operator){
  let left = parseFloat(lhs.value);
  let right = parseFloat(rhs.value);
  let result = 0;
  if (operator == '+') {
    result = left + right;
  }
  else if (operator == '-') {
    result = left - right;
  }
  else if (operator == '*') {
    result = left * right;
  }
  else if (operator == '/') {
    result = left / right;
  }
  return {type: 'number', value: result};
}

