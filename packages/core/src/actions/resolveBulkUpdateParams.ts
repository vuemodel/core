import { Model } from 'pinia-orm'
import { BulkUpdateOptions } from '../contracts/bulk-update/BulkUpdate'
import { Form } from '../types/Form'

export function resolveBulkUpdateParams<T extends typeof Model> (...params: any[]): {
  ModelClass: T
  forms: Record<string | number, Form<InstanceType<T>>>
  options: BulkUpdateOptions<T>
} {
  if (typeof params[0] === 'string') {
    const paramsWithoutDriver = params.slice(1)
    return {
      ModelClass: paramsWithoutDriver[0],
      forms: paramsWithoutDriver[1],
      options: paramsWithoutDriver?.[2] ?? {},
    }
  }

  return {
    ModelClass: params[0],
    forms: params[1],
    options: params?.[2] ?? {},
  }
}
