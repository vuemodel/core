import { getDriverFunction } from '../getDriverFunction'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateResponse } from '../types/Response'
import { resolveBatchUpdateParams } from './resolveBatchUpdateParams'
import { BatchUpdate, BatchUpdateOptions } from '../contracts/batch-update/BatchUpdate'
import clone from 'just-clone'
import { OnBatchUpdatedMessage, OnBatchUpdatingMessage } from '../types/BroadcastMessages'

/**
 * Batch update records on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param form Forms keyed by id
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await batchUpdate(Post, {
 *   '1': {
 *      title: 'Once upon a time...',
 *    },
 *    '2': {
 *      body: 'Elegance!'
 *    }
 * })
 */
export function batchUpdate<T extends typeof Model> (
  ModelClass: T | string,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>> | T,
  options?: BatchUpdateOptions<T> | Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  hasDriverOptions?: BatchUpdateOptions<T>,
): Promise<BatchUpdateResponse<T>> {
  const params = resolveBatchUpdateParams<T>(ModelClass, forms, options, hasDriverOptions)
  const driverKey = typeof ModelClass === 'string' ? ModelClass : (options as BatchUpdateOptions<T>)?.driver

  const driver = getDriverFunction('batchUpdate', driverKey) as BatchUpdate<T>

  const entity = params.ModelClass.entity

  const batchUpdatingChannel = new BroadcastChannel(`vuemodel.${driverKey}.batchUpdating`)
  const batchUpdatedChannel = new BroadcastChannel(`vuemodel.${driverKey}.batchUpdated`)
  const batchUpdatingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.batchUpdating`)
  const batchUpdatedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.batchUpdated`)

  const batchUpdatingPostMessage: OnBatchUpdatingMessage<T> = clone({ entity, forms: params.forms })

  batchUpdatingChannel.postMessage(batchUpdatingPostMessage)
  batchUpdatingEntityChannel.postMessage(batchUpdatingPostMessage)

  return driver(params.ModelClass, params.forms, params.options)
    .then(response => {
      const batchUpdatedPostMessage: OnBatchUpdatedMessage<T> = clone({ entity, response })
      batchUpdatedChannel.postMessage(batchUpdatedPostMessage)
      batchUpdatedEntityChannel.postMessage(batchUpdatedPostMessage)

      return response
    })
}
