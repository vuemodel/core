import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'
import { UseBatchUpdater, UseBatchUpdaterOptions, UseBatchUpdaterReturn } from '../contracts/batch-update/UseBatchUpdater'

export function useBatchUpdater<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseBatchUpdaterOptions<T> | T,
  driverOptions?: UseBatchUpdaterOptions<T>,
): UseBatchUpdaterReturn<T> {
  const params = resolveParams<T, UseBatchUpdaterOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useBatchUpdater', params.driver) as unknown as UseBatchUpdater<T>

  return driver(params.ModelClass, params.options)
}
