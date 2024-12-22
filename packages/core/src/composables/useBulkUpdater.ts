import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'
import { UseBulkUpdater, UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../contracts/bulk-update/UseBulkUpdater'

export function useBulkUpdater<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseBulkUpdaterOptions<T> | T,
  driverOptions?: UseBulkUpdaterOptions<T>,
): UseBulkUpdaterReturn<T> {
  const params = resolveParams<T, UseBulkUpdaterOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useBulkUpdater', params.driver) as unknown as UseBulkUpdater<T>

  return driver(params.ModelClass, params.options)
}
