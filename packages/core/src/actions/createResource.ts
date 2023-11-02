import { getImplementation } from '../getImplementation'
import { CreateResource, CreateResourceOptions } from '../contracts/crud/create/CreateResource'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../types/ResourceResponse'

export function createResource<T extends typeof Model> (
  model: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: CreateResourceOptions,
): Promise<CreateResponse<T>> {
  const implementation = getImplementation('createResource', options?.driver) as CreateResource<T>

  return implementation(model, form, options)
}
