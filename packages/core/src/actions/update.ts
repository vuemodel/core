import { getDriverFunction } from '../getDriverFunction'
import { Update, UpdateOptions } from '../contracts/crud/update/Update'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveUpdateParams } from './resolveUpdateParams'
import clone from 'just-clone'
import { OnUpdatedMessage, OnUpdatingMessage } from '../types/BroadcastMessages'

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
  const driverKey = typeof ModelClass === 'string' ? ModelClass : (options as UpdateOptions<T>)?.driver

  const driver = getDriverFunction('update', driverKey) as Update<T>

  const entity = params.ModelClass.entity

  const updatingChannel = new BroadcastChannel(`vuemodel.${driverKey}.updating`)
  const updatedChannel = new BroadcastChannel(`vuemodel.${driverKey}.updated`)
  const updatingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.updating`)
  const updatedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.updated`)

  const updatingPostMessage: OnUpdatingMessage<T> = clone({ entity, form: params.form, id: params.id })

  updatingChannel.postMessage(updatingPostMessage)
  updatingEntityChannel.postMessage(updatingPostMessage)

  return driver(
    params.ModelClass,
    params.id,
    params.form,
    params.options,
  ).then(response => {
    const updatedPostMessage: OnUpdatedMessage<T> = clone({ entity, response })
    updatedChannel.postMessage(updatedPostMessage)
    updatedEntityChannel.postMessage(updatedPostMessage)
    return response
  })
}
