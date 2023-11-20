export function difference<T> (target: any[], toDestroy: any[]) {
  const toDestroySet = new Set(toDestroy)

  const result = target.filter(x => !toDestroySet.has(x))

  return result as T[]
}
