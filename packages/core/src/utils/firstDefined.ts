export function firstDefined<T extends any[]> (arr: [...T]): Exclude<T[number], undefined> | undefined {
  return arr.find(value => value !== undefined) as Exclude<T[number], undefined> | undefined
}
