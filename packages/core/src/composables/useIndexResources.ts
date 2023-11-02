import { UseIndexResources, UseIndexResourcesOptions, UseIndexResourcesReturn } from '../contracts/crud/index/UseIndexResources'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'

export function useIndexResources<T extends typeof Model> (
  model: T,
  options?: UseIndexResourcesOptions<T>,
): UseIndexResourcesReturn<T> {
  const implementation = getImplementation('useIndexResources', options?.driver) as UseIndexResources<T>

  return implementation(model, options)
}
