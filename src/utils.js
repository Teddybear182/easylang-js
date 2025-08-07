export function makeNull(){
  return {type: 'null', value: 'null'};
}

export function makeNumber(number=0){
  return {type: 'number', value: parseFloat(number)};
}

export function makeIdentifier(id){
  return {type: 'identifier', value: id};
}

export function makeString(str){
  return {type: 'string', value: str};
}

export function makeNativeFunction(call){
  return {type: 'nativeFunction', call}
}

export function makeObject(elements){
  const properties = new Map();
  for(const prop of elements){
    const key = prop.key;
    const value = prop.value;
    properties.set(key,value);
  }
  return {
    type: 'object',
    properties
  };
}

export function makeArray(elements){
  const properties = new Array();
  for(const prop of elements){
    properties.push(prop)
  }
  return {
    type: 'array',
    properties
  };
}