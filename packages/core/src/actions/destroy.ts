import { getImplementation } from '../getImplementation'
import { Destroy, DestroyOptions } from '../contracts/crud/destroy/Destroy'
import { Model } from 'pinia-orm'
import { DestroyResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveDestroyParams } from './resolveDestroyParams'

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
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as DestroyOptions<T>)?.driver

  const implementation = getImplementation('destroy', driver) as Destroy<T>

  const entity = params.ModelClass.entity

  const destroyingChannel = new BroadcastChannel(`vuemodel.${driver}.destroying`)
  const destroyedChannel = new BroadcastChannel(`vuemodel.${driver}.destroyed`)
  const destroyingEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.destroying`)
  const destroyedEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.destroyed`)

  const destroyingPostMessage = { entity }

  destroyingChannel.postMessage(destroyingPostMessage)
  destroyingEntityChannel.postMessage(destroyingPostMessage)

  return implementation(
    params.ModelClass,
    params.id,
    params.options,
  ).then(response => {
    const destroyedPostMessage = { entity, response }
    destroyedChannel.postMessage(destroyedPostMessage)
    destroyedEntityChannel.postMessage(destroyedPostMessage)
    return response
  })
}
