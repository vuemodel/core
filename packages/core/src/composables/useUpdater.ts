import { UseUpdater, UseUpdaterOptions, UseUpdaterReturn } from '../contracts/crud/update/UseUpdater'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useUpdater<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseUpdaterOptions<T> | T,
  driverOptions?: UseUpdaterOptions<T>,
): UseUpdaterReturn<T> {
  const params = resolveParams<T, UseUpdaterOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useUpdater', params.driver) as unknown as UseUpdater<T>

  return driver(params.ModelClass, params.options)
}
