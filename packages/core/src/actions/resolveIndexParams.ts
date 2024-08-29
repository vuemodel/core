import { Model } from 'pinia-orm'
import { IndexOptions } from '../contracts/crud/index/Index'

export function resolveIndexParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  options: IndexOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      options: paramsWithoutDriver?.[1] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    options: params?.[1] ?? {},
  }
}
