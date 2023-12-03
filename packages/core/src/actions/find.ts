import { getImplementation } from '../getImplementation'
import { Find, FindOptions } from '../contracts/crud/find/Find'
import { Model } from 'pinia-orm'
import { FindResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveParams } from './resolveParams'

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
  ModelClass: T | string,
  id: LoosePrimaryKey | T,
  options?: FindOptions<T> | LoosePrimaryKey,
  hasDriverOptions?: FindOptions<T>,
): Promise<FindResponse<T>> {
  const params = resolveParams(ModelClass, id, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as FindOptions<T>)?.driver

  const implementation = getImplementation('find', driver) as Find<T>

  return implementation(...(params as [T, LoosePrimaryKey, FindOptions<T>]))
}
