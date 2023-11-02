import { getImplementation } from '../getImplementation'
import { RemoveResource, RemoveResourceOptions } from '../contracts/crud/remove/RemoveResource'
import { Model } from 'pinia-orm'
import { RemoveResponse } from '../types/ResourceResponse'

export function removeResource<T extends typeof Model> (
  model: T,
  id: string,
  options?: RemoveResourceOptions,
): Promise<RemoveResponse<T>> {
  const implementation = getImplementation('removeResource', options?.driver) as RemoveResource<T>

  return implementation(model, id, options)
}
