import { getImplementation } from '../getImplementation'
import { Index, IndexOptions } from '../contracts/crud/index/Index'
import { Model } from 'pinia-orm'
import { IndexResponse } from '../types/Response'

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
  ModelClass: T,
  options?: IndexOptions<T>,
): Promise<IndexResponse<T>> {
  const implementation = getImplementation('index', options?.driver) as Index<T>

  return implementation(ModelClass, options)
}
