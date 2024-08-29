import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateOptions } from '../contracts/crud/create/Create'

export function resolveCreateParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  form: PiniaOrmForm<InstanceType<T>>
  options: CreateOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      form: paramsWithoutDriver[1],
      options: paramsWithoutDriver?.[2] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    form: params[1],
    options: params?.[2] ?? {},
  }
}
