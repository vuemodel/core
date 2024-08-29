import { UseFinder, UseFinderOptions, UseFinderReturn } from '../contracts/crud/find/UseFinder'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useFinder<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseFinderOptions<T> | T,
  driverOptions?: UseFinderOptions<T>,
): UseFinderReturn<T> {
  const params = resolveParams<T, UseFinderOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useFinder', params.driver) as unknown as UseFinder<T>

  return driver(params.ModelClass, params.options)
}
