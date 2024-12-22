import { getDriverFunction } from '../getDriverFunction'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BulkUpdateResponse } from '../types/Response'
import { resolveBulkUpdateParams } from './resolveBulkUpdateParams'
import { BulkUpdate, BulkUpdateOptions } from '../contracts/bulk-update/BulkUpdate'
import clone from 'just-clone'
import { OnBulkUpdatedMessage, OnBulkUpdatingMessage } from '../broadcasting/BroadcastMessages'
import { getDriverKey } from '../utils/getDriverKey'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { deepmerge } from 'deepmerge-ts'

/**
 * Bulk update records on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param form Forms keyed by id
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await bulkUpdate(Post, {
 *   '1': {
 *      title: 'Once upon a time...',
 *    },
 *    '2': {
 *      body: 'Elegance!'
 *    }
 * })
 */
export function bulkUpdate<T extends typeof Model> (
  ModelClass: T | string,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>> | T,
  options?: BulkUpdateOptions<T> | Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  hasDriverOptions?: BulkUpdateOptions<T>,
): Promise<BulkUpdateResponse<T>> {
  const params = resolveBulkUpdateParams<T>(ModelClass, forms, options, hasDriverOptions)
  const driverKey = getDriverKey(params.options.driver)

  const driver = getDriverFunction('bulkUpdate', driverKey) as BulkUpdate<T>

  const entity = params.ModelClass.entity

  const driverConfig = getMergedDriverConfig(driverKey)

  const bulkUpdatingHooks = deepmerge(driverConfig.hooks?.bulkUpdating ?? [])
  const bulkUpdatedHooks = deepmerge(driverConfig.hooks?.bulkUpdated ?? [])

  const bulkUpdatingChannel = new BroadcastChannel(`vuemodel.${driverKey}.bulkUpdating`)
  const bulkUpdatedChannel = new BroadcastChannel(`vuemodel.${driverKey}.bulkUpdated`)
  const bulkUpdatingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.bulkUpdating`)
  const bulkUpdatedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.bulkUpdated`)

  const bulkUpdatingPostMessage: OnBulkUpdatingMessage<T> = clone({ entity, forms: params.forms })

  bulkUpdatingHooks.forEach(async hook => await hook({ ModelClass: params.ModelClass, entity, forms: params.forms }))

  bulkUpdatingChannel.postMessage(bulkUpdatingPostMessage)
  bulkUpdatingEntityChannel.postMessage(bulkUpdatingPostMessage)

  return driver(params.ModelClass, params.forms, params.options)
    .then(response => {
      if (response.success) {
        const bulkUpdatedPostMessage: OnBulkUpdatedMessage<T> = clone({ entity, response })

        bulkUpdatedHooks.forEach(async hook => hook({ ModelClass: params.ModelClass, entity, response }))

        bulkUpdatedChannel.postMessage(bulkUpdatedPostMessage)
        bulkUpdatedEntityChannel.postMessage(bulkUpdatedPostMessage)
      }

      return response
    })
}
