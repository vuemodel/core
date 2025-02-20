import { UseModel, UseModelOptions, UseModelReturn } from '../contracts/crud/use-model/UseModel'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useModel<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseModelOptions<T> | T,
  driverOptions?: UseModelOptions<T>,
): UseModelReturn<T> {
  const params = resolveParams<T, UseModelOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useModel', params.driver) as unknown as UseModel<T>

  return driver(params.ModelClass, params.options) as unknown as UseModelReturn<T>
}
