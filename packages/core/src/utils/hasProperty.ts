export function hasProperty<T> (obj: T, prop: keyof T): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}
