import { getImplementation } from '../getImplementation'
import { FindResource, FindResourceOptions } from '../contracts/crud/find/FindResource'
import { Model } from 'pinia-orm'
import { FindResponse } from '../types/ResourceResponse'

export function findResource<T extends typeof Model> (
  model: T,
  id: string,
  options?: FindResourceOptions<T>,
): Promise<FindResponse<T>> {
  const implementation = getImplementation('findResource', options?.driver) as FindResource<T>

  return implementation(model, id, options)
}
