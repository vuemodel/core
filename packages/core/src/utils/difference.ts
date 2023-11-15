export function difference<T> (target: any[], toRemove: any[]) {
  const toRemoveSet = new Set(toRemove)

  const result = target.filter(x => !toRemoveSet.has(x))

  return result as T[]
}
