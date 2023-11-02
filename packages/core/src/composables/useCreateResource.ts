import { UseCreateResource, UseCreateResourceOptions, UseCreateResourceReturn } from '../contracts/crud/create/UseCreateResource'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'

export function useCreateResource<T extends typeof Model> (
  model: T,
  options?: UseCreateResourceOptions<T>,
): UseCreateResourceReturn<T> {
  const implementation = getImplementation('useCreateResource', options?.driver) as UseCreateResource<T>

  return implementation(model, options)
}
