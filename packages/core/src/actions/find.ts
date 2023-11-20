import { getImplementation } from '../getImplementation'
import { Find, FindOptions } from '../contracts/crud/find/Find'
import { Model } from 'pinia-orm'
import { FindResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

/**
 * Find a record on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param id Primary key of the record to find
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await find(Post, '1')
 */
export function find<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options?: FindOptions<T>,
): Promise<FindResponse<T>> {
  const implementation = getImplementation('find', options?.driver) as Find<T>

  return implementation(ModelClass, id, options)
}
