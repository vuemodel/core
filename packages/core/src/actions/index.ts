import { getImplementation } from '../getImplementation'
import { Index, IndexOptions } from '../contracts/crud/index/Index'
import { Model } from 'pinia-orm'
import { IndexResponse } from '../types/Response'
import { resolveParams } from './resolveParams'

/**
 * List records from the backend
 *
 * @param ModelClass The PiniaORM model
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await index(Post)
 * console.log(response.records)
 *
 * @example
 * // Pagination
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await index(
 *   Post,
 *   { pagination: { page: 2, recordsPerPage: 5 } }
 * )
 */
export function index<T extends typeof Model> (
  ModelClass: T | string,
  options?: IndexOptions<T> | T,
  hasDriverOptions?: IndexOptions<T>,
): Promise<IndexResponse<T>> {
  const params = resolveParams(ModelClass, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as IndexOptions<T>)?.driver

  const implementation = getImplementation('index', driver) as Index<T>

  return implementation(...(params as [T, IndexOptions<T>]))
}
