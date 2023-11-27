export function getFirstDefined<T> (items: (T | undefined)[]) {
  return items.find(item => item !== undefined)
}
