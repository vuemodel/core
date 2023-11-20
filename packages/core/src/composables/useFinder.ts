import { UseFinder, UseFinderOptions, UseFinderReturn } from '../contracts/crud/find/UseFinder'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'
import { resolveParams } from './resolveParams'

export function useFinder<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseFinderOptions<T> | T,
  driverOptions?: UseFinderOptions<T>,
): UseFinderReturn<T> {
  const params = resolveParams<T, UseFinderOptions<T>>(ModelClass, options, driverOptions)
  const implementation = getImplementation('useFinder', params.driver) as UseFinder<T>

  return implementation(params.ModelClass, params.options)
}
