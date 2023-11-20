import { getImplementation } from '../getImplementation'
import { Destroy, DestroyOptions } from '../contracts/crud/destroy/Destroy'
import { Model } from 'pinia-orm'
import { DestroyResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

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
  ModelClass: T,
  id: LoosePrimaryKey,
  options?: DestroyOptions<T>,
): Promise<DestroyResponse<T>> {
  const implementation = getImplementation('destroy', options?.driver) as Destroy<T>

  return implementation(ModelClass, id, options)
}
