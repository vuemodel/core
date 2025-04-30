import { isPojo } from './isPojo'

export type RemoveFunctions<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never :
    T[K] extends object ? RemoveFunctions<T[K]> : T[K]
}

export function removeFunctions<T extends object> (obj: T): RemoveFunctions<T> {
  const result: Partial<T> = {}

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (!isPojo(obj[key])) {
        continue
      }
      // Recursively apply removeFunctions to nested objects
      /** @ts-expect-error Hard to type, no benefit */
      result[key] = removeFunctions(obj[key])
    } else if (typeof obj[key] !== 'function') {
      result[key] = obj[key]
    }
  }

  return result as RemoveFunctions<T>
}
