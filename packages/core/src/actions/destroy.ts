import { getImplementation } from '../getImplementation'
import { Destroy, DestroyOptions } from '../contracts/crud/destroy/Destroy'
import { Model } from 'pinia-orm'
import { DestroyResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveParams } from './resolveParams'

/**
 * Destroy (delete) a record on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param id Primary key of the record for update
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await destroy(Post, '6')
 */
export function destroy<T extends typeof Model> (
  ModelClass: T | string,
  id: LoosePrimaryKey | T,
  options?: DestroyOptions<T> | LoosePrimaryKey,
  hasDriverOptions?: DestroyOptions<T>,
): Promise<DestroyResponse<T>> {
  const params = resolveParams(ModelClass, id, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as DestroyOptions<T>)?.driver

  const implementation = getImplementation('destroy', driver) as Destroy<T>

  return implementation(...(params as [T, LoosePrimaryKey, DestroyOptions<T>]))
}
