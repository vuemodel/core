import { getImplementation } from '../getImplementation'
import { IndexResources, IndexResourcesOptions } from '../contracts/crud/index/IndexResources'
import { Model } from 'pinia-orm'
import { IndexResponse } from '../types/ResourceResponse'

export function indexResources<T extends typeof Model> (
  model: T,
  options?: IndexResourcesOptions<T>,
): Promise<IndexResponse<T>> {
  const implementation = getImplementation('indexResources', options?.driver) as IndexResources<T>

  return implementation(model, options)
}
