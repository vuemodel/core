import { UseCreator, UseCreatorOptions, UseCreatorReturn } from '../contracts/crud/create/UseCreator'
import { Model } from 'pinia-orm'
import { getDriverFunction } from '../getDriverFunction'
import { resolveParams } from './resolveParams'

export function useCreator<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseCreatorOptions<T> | T,
  driverOptions?: UseCreatorOptions<T>,
): UseCreatorReturn<T> {
  const params = resolveParams<T, UseCreatorOptions<T>>(ModelClass, options, driverOptions)
  const driver = getDriverFunction('useCreator', params.driver) as unknown as UseCreator<T>

  return driver(params.ModelClass, params.options)
}
