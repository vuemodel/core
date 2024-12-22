import { getDriverFunction } from '../getDriverFunction'
import { Index, IndexOptions } from '../contracts/crud/index/Index'
import { Model } from 'pinia-orm'
import { IndexResponse } from '../types/Response'
import { resolveIndexParams } from './resolveIndexParams'
import clone from 'just-clone'
import { OnIndexedMessage, OnIndexingMessage } from '../broadcasting/BroadcastMessages'
import { removeFunctions } from '../utils/removeFunctions'
import { getDriverKey } from '../utils/getDriverKey'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { deepmerge } from 'deepmerge-ts'

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
  const driverKey = getDriverKey(params.options.driver)

  const driver = getDriverFunction('index', driverKey) as Index<T>

  const entity = params.ModelClass.entity

  const driverConfig = getMergedDriverConfig(driverKey)

  const indexingHooks = deepmerge(driverConfig.hooks?.indexing ?? [])
  const indexedHooks = deepmerge(driverConfig.hooks?.indexed ?? [])

  const indexingChannel = new BroadcastChannel(`vuemodel.${driverKey}.indexing`)
  const indexedChannel = new BroadcastChannel(`vuemodel.${driverKey}.indexed`)
  const indexingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.indexing`)
  const indexedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.indexed`)

  const useIndexerOptionsWithoutFunction = params.options._useIndexerOptions ? removeFunctions(params.options._useIndexerOptions) : {}

  const indexingPostMessage: OnIndexingMessage<T> = clone({
    entity,
    with: params.options.with ?? {},
    filters: params.options.filters ?? {},
    orderBy: params.options.orderBy ?? [],
    pagination: params.options.pagination ?? {},
    _useIndexerOptions: useIndexerOptionsWithoutFunction,
  })

  indexingHooks.forEach(async hook => await hook({
    ModelClass: params.ModelClass,
    entity,
    with: params.options.with ?? {},
    filters: params.options.filters ?? {},
    orderBy: params.options.orderBy ?? [],
    pagination: params.options.pagination ?? {},
    _useIndexerOptions: useIndexerOptionsWithoutFunction as any,
  }))

  indexingChannel.postMessage(indexingPostMessage)
  indexingEntityChannel.postMessage(indexingPostMessage)

  return driver(
    params.ModelClass,
    params.options,
  ).then(response => {
    if (response.success) {
      const indexedPostMessage: OnIndexedMessage<T> = clone({
        entity,
        response,
        with: params.options.with ?? {},
        filters: params.options.filters ?? {},
        orderBy: params.options.orderBy ?? [],
        pagination: params.options.pagination ?? {},
        _useIndexerOptions: useIndexerOptionsWithoutFunction,
      })

      indexedHooks.forEach(async hook => await hook({
        ModelClass: params.ModelClass,
        entity,
        response,
        with: params.options.with ?? {},
        filters: params.options.filters ?? {},
        orderBy: params.options.orderBy ?? [],
        pagination: params.options.pagination ?? {},
        _useIndexerOptions: useIndexerOptionsWithoutFunction as any,
      }))

      indexedChannel.postMessage(indexedPostMessage)
      indexedEntityChannel.postMessage(indexedPostMessage)
    }
    return response
  })
}
