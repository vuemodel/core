import { UseIndexer, UseIndexerOptions, UseIndexerReturn } from '../contracts/crud/index/UseIndexer'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useIndexer<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseIndexerOptions<T> | T,
  driverOptions?: UseIndexerOptions<T>,
): UseIndexerReturn<T> {
  const params = resolveParams<T, UseIndexerOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useIndexer', params.driver) as unknown as UseIndexer<T>

  return driver(params.ModelClass, params.options)
}
