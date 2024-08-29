import { getDriverFunction } from '../getDriverFunction'
import { Find, FindOptions } from '../contracts/crud/find/Find'
import { Model } from 'pinia-orm'
import { FindResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveFindParams } from './resolveFindParams'
import clone from 'just-clone'
import { OnFindingMessage, OnFoundMessage } from '../types/BroadcastMessages'

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
  const params = resolveFindParams<T>(ModelClass, id, options, hasDriverOptions)
  const driverKey = typeof ModelClass === 'string' ? ModelClass : (options as FindOptions<T>)?.driver

  const driver = getDriverFunction('find', driverKey) as Find<T>

  const entity = params.ModelClass.entity

  const findingChannel = new BroadcastChannel(`vuemodel.${driverKey}.finding`)
  const foundChannel = new BroadcastChannel(`vuemodel.${driverKey}.found`)
  const findingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.finding`)
  const foundEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.found`)

  const findingPostMessage: OnFindingMessage<T> = clone({
    entity,
    with: params.options.with ?? {},
    id: params.id,
  })

  findingChannel.postMessage(findingPostMessage)
  findingEntityChannel.postMessage(findingPostMessage)

  return driver(
    params.ModelClass,
    params.id,
    params.options,
  ).then(response => {
    const foundPostMessage: OnFoundMessage<T> = clone({
      entity,
      response,
      with: params.options.with ?? {},
    })
    foundChannel.postMessage(foundPostMessage)
    foundEntityChannel.postMessage(foundPostMessage)
    return response
  })
}
