import { getImplementation } from '../getImplementation'
import { Index, IndexOptions } from '../contracts/crud/index/Index'
import { Model } from 'pinia-orm'
import { IndexResponse } from '../types/Response'
import { resolveIndexParams } from './resolveIndexParams'

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
  const params = resolveIndexParams<T>(ModelClass, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as IndexOptions<T>)?.driver

  const implementation = getImplementation('index', driver) as Index<T>

  const entity = params.ModelClass.entity

  const indexingChannel = new BroadcastChannel(`vuemodel.${driver}.indexing`)
  const indexedChannel = new BroadcastChannel(`vuemodel.${driver}.indexed`)
  const indexingEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.indexing`)
  const indexedEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.indexed`)

  const indexingPostMessage = {
    entity,
    with: params.options.with ?? {},
    filters: params.options.filters ?? {},
    orderBy: params.options.orderBy ?? [],
    pagination: params.options.pagination ?? {},
    _useIndexerOptions: params.options._useIndexerOptions ?? {},
  }

  indexingChannel.postMessage(indexingPostMessage)
  indexingEntityChannel.postMessage(indexingPostMessage)

  return implementation(
    params.ModelClass,
    params.options,
  ).then(response => {
    const indexedPostMessage = {
      entity,
      response,
      with: params.options.with ?? {},
      filters: params.options.filters ?? {},
      orderBy: params.options.orderBy ?? [],
      pagination: params.options.pagination ?? {},
      _useIndexerOptions: params.options._useIndexerOptions ?? {},
    }
    indexedChannel.postMessage(indexedPostMessage)
    indexedEntityChannel.postMessage(indexedPostMessage)
    return response
  })
}
