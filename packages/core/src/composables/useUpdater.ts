import { UseUpdater, UseUpdaterOptions, UseUpdaterReturn } from '../contracts/crud/update/UseUpdater'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'
import { resolveParams } from './resolveParams'

export function useUpdater<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseUpdaterOptions<T> | T,
  driverOptions?: UseUpdaterOptions<T>,
): UseUpdaterReturn<T> {
  const params = resolveParams<T, UseUpdaterOptions<T>>(ModelClass, options, driverOptions)
  const implementation = getImplementation('useUpdater', params.driver) as UseUpdater<T>

  return implementation(params.ModelClass, params.options)
}
