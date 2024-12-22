import { getDriverFunction } from '../getDriverFunction'
import { Destroy, DestroyOptions } from '../contracts/crud/destroy/Destroy'
import { Model } from 'pinia-orm'
import { DestroyResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveDestroyParams } from './resolveDestroyParams'
import clone from 'just-clone'
import { OnDestroyingMessage, OnDestroyedMessage } from '../broadcasting/BroadcastMessages'
import { getDriverKey } from '../utils/getDriverKey'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { deepmerge } from 'deepmerge-ts'

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
  ModelClass: T | string,
  id: LoosePrimaryKey | T,
  options?: DestroyOptions<T> | LoosePrimaryKey,
  hasDriverOptions?: DestroyOptions<T>,
): Promise<DestroyResponse<T>> {
  const params = resolveDestroyParams<T>(ModelClass, id, options, hasDriverOptions)
  const driverKey = getDriverKey(params.options.driver)

  const driver = getDriverFunction('destroy', driverKey) as Destroy<T>

  const entity = params.ModelClass.entity

  const driverConfig = getMergedDriverConfig(driverKey)

  const destroyingHooks = deepmerge(driverConfig.hooks?.destroying ?? [])
  const destroyedHooks = deepmerge(driverConfig.hooks?.destroyed ?? [])

  const destroyingChannel = new BroadcastChannel(`vuemodel.${driverKey}.destroying`)
  const destroyedChannel = new BroadcastChannel(`vuemodel.${driverKey}.destroyed`)
  const destroyingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.destroying`)
  const destroyedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.destroyed`)

  const destroyingPostMessage: OnDestroyingMessage = clone({ entity, id: params.id })

  destroyingHooks.forEach(async hook => await hook({ ModelClass: params.ModelClass, entity, id: params.id }))

  destroyingChannel.postMessage(destroyingPostMessage)
  destroyingEntityChannel.postMessage(destroyingPostMessage)

  return driver(
    params.ModelClass,
    params.id,
    params.options,
  ).then(response => {
    if (response.success) {
      const destroyedPostMessage: OnDestroyedMessage<T> = clone({ entity, response })

      destroyedHooks.forEach(async hook => await hook({ ModelClass: params.ModelClass, entity, response }))

      destroyedChannel.postMessage(destroyedPostMessage)
      destroyedEntityChannel.postMessage(destroyedPostMessage)
    }
    return response
  })
}
