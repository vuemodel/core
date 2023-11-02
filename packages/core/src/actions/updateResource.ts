import { getImplementation } from '../getImplementation'
import { UpdateResource, UpdateResourceOptions } from '../contracts/crud/update/UpdateResource'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../types/ResourceResponse'

export function updateResource<T extends typeof Model> (
  model: T,
  id: string,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: UpdateResourceOptions,
): Promise<UpdateResponse<T>> {
  const implementation = getImplementation('updateResource', options?.driver) as UpdateResource<T>

  return implementation(model, id, form, options)
}
