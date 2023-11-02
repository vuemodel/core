import { UseRemoveResource, UseRemoveResourceOptions, UseRemoveResourceReturn } from '../contracts/crud/remove/UseRemoveResource'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'

export function useRemoveResource<T extends typeof Model> (
  model: T,
  options?: UseRemoveResourceOptions<T>,
): UseRemoveResourceReturn<T> {
  const implementation = getImplementation('useRemoveResource', options?.driver) as UseRemoveResource<T>

  return implementation(model, options)
}
