import { UseCreator, UseCreatorOptions, UseCreatorReturn } from '../contracts/crud/create/UseCreator'
import { Model } from 'pinia-orm'
import { getImplementation } from '../getImplementation'
import { resolveParams } from './resolveParams'

export function useCreator<T extends typeof Model> (
  ModelClass: T | string,
  options?: UseCreatorOptions<T> | T,
  driverOptions?: UseCreatorOptions<T>,
): UseCreatorReturn<T> {
  const params = resolveParams<T, UseCreatorOptions<T>>(ModelClass, options, driverOptions)
  const implementation = getImplementation('useCreator', params.driver) as UseCreator<T>

  return implementation(params.ModelClass, params.options)
}
