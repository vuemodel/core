import { UseDestroyer, UseDestroyerOptions, UseDestroyerReturn } from '../contracts/crud/destroy/UseDestroyer'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'
import { resolveParams } from './resolveParams'

export function useDestroyer<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseDestroyerOptions<T> | T,
  driverOptions?: UseDestroyerOptions<T>,
): UseDestroyerReturn<T> {
  const params = resolveParams<T, UseDestroyerOptions<T>>(ModelClass, options, driverOptions)
  const implementation = getImplementation('useDestroyer', params.driver) as UseDestroyer<T>

  return implementation(params.ModelClass, params.options)
}
