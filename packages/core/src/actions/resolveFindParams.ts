import { Model } from 'pinia-orm'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { FindOptions } from '../contracts/crud/find/Find'

export function resolveFindParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  id: LoosePrimaryKey
  options: FindOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      id: paramsWithoutDriver[1],
      options: paramsWithoutDriver?.[2] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    id: params[1],
    options: params?.[2] ?? {},
  }
}
