export function makeNull(){
  return {type: 'null', value: 'null'};
}

export function makeNumber(number=0){
  return {type: 'number', value: number};
}

export function makeIdentifier(id){
  return {type: 'identifier', value: id};
}
