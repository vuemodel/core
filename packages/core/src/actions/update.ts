import { getImplementation } from '../getImplementation'
import { Update, UpdateOptions } from '../contracts/crud/update/Update'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveUpdateParams } from './resolveUpdateParams'

/**
 * Update a record on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param id Primary key of the record for update
 * @param form Object used to update the record
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await update(
 *   Post,
 *   '4',
 *   { title: 'Once upon a December.' },
 * )
 */
export function update<T extends typeof Model> (
  ModelClass: T | string,
  id: LoosePrimaryKey | T,
  form: PiniaOrmForm<InstanceType<T>> | LoosePrimaryKey,
  options?: UpdateOptions<T> | PiniaOrmForm<InstanceType<T>>,
  hasDriverOptions?: UpdateOptions<T>,
): Promise<UpdateResponse<T>> {
  const params = resolveUpdateParams<T>(ModelClass, id, form, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as UpdateOptions<T>)?.driver

  const implementation = getImplementation('update', driver) as Update<T>

  const entity = params.ModelClass.entity

  const updatingChannel = new BroadcastChannel(`vuemodel.${driver}.updating`)
  const updatedChannel = new BroadcastChannel(`vuemodel.${driver}.updated`)
  const updatingEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.updating`)
  const updatedEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.updated`)

  const updatingPostMessage = { entity, form }

  updatingChannel.postMessage(updatingPostMessage)
  updatingEntityChannel.postMessage(updatingPostMessage)

  return implementation(
    params.ModelClass,
    params.id,
    params.form,
    params.options,
  ).then(response => {
    const updatedPostMessage = { entity, response }
    updatedChannel.postMessage(updatedPostMessage)
    updatedEntityChannel.postMessage(updatedPostMessage)
    return response
  })
}
