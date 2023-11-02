import { UseFindResource, UseFindResourceOptions, UseFindResourceReturn } from '../contracts/crud/find/UseFindResource'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'

export function useFindResource<T extends typeof Model> (
  model: T,
  options?: UseFindResourceOptions<T>,
): UseFindResourceReturn<T> {
  const implementation = getImplementation('useFindResource', options?.driver) as UseFindResource<T>

  return implementation(model, options)
}
