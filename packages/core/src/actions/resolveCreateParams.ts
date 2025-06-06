import { Model } from 'pinia-orm'
import { CreateOptions } from '../contracts/crud/create/Create'
import { Form } from '../types/Form'

export function resolveCreateParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  form: Form<InstanceType<T>>
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
