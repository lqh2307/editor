/**
 * Deep clone an object using JSON serialization
 * @param {any} obj The object to clone
 * @returns {any} The deep-cloned object
 */
export function deepClone(obj?: any): any {
  if (obj !== undefined) {
    return JSON.parse(JSON.stringify(obj));
  }
}

export function updateObjects(
  obj: any,
  updates: any,
  isDeepClone: boolean
): any {
  const newObj: any = isDeepClone ? deepClone(obj) : { ...obj };

  Object.assign(newObj, updates);

  return newObj;
}

export function updateArrays(
  arr: any,
  indexs: number[],
  values: any,
  isDeepClone: boolean
): any {
  const newArr: any = isDeepClone ? deepClone(arr) : [...arr];

  indexs.forEach((index) => (newArr[index] = values[index]));

  return newArr;
}
