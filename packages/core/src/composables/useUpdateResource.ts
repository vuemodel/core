import { UseUpdateResource, UseUpdateResourceOptions, UseUpdateResourceReturn } from '../contracts/crud/update/UseUpdateResource'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'

export function useUpdateResource<T extends typeof Model> (
  model: T,
  options?: UseUpdateResourceOptions<T>,
): UseUpdateResourceReturn<T> {
  const implementation = getImplementation('useUpdateResource', options?.driver) as UseUpdateResource<T>

  return implementation(model, options)
}
