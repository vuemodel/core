import { UseIndexer, UseIndexerOptions, UseIndexerReturn } from '../contracts/crud/index/UseIndexer'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'
import { resolveParams } from './resolveParams'

export function useIndexer<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseIndexerOptions<T> | T,
  driverOptions?: UseIndexerOptions<T>,
): UseIndexerReturn<T> {
  const params = resolveParams<T, UseIndexerOptions<T>>(ModelClass, options, driverOptions)
  const implementation = getImplementation('useIndexer', params.driver) as UseIndexer<T>

  return implementation(params.ModelClass, params.options)
}
