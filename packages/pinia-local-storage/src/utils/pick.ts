export function pick<T> (obj: T, props: string[]): Partial<T> {
  const result: Partial<T> = {}
  for (const prop of props) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      result[prop as keyof T] = obj[prop as keyof T]
    }
  }
  return result
}
