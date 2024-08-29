import { UseDestroyer, UseDestroyerOptions, UseDestroyerReturn } from '../contracts/crud/destroy/UseDestroyer'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useDestroyer<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseDestroyerOptions<T> | T,
  driverOptions?: UseDestroyerOptions<T>,
): UseDestroyerReturn<T> {
  const params = resolveParams<T, UseDestroyerOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useDestroyer', params.driver) as unknown as UseDestroyer<T>

  return driver(params.ModelClass, params.options)
}
