import { Model } from 'pinia-orm'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { UpdateOptions } from '../contracts/crud/update/Update'
import { Form } from '../types/Form'

export function resolveUpdateParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  id: LoosePrimaryKey
  form: Form<InstanceType<T>>
  options: UpdateOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      id: paramsWithoutDriver[1],
      form: paramsWithoutDriver?.[2],
      options: paramsWithoutDriver?.[3] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    id: params[1],
    form: params?.[2],
    options: params?.[3] ?? {},
  }
}
