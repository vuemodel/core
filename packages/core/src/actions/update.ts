import { getDriverFunction } from '../getDriverFunction'
import { Update, UpdateOptions } from '../contracts/crud/update/Update'
import { Model } from 'pinia-orm'
import { UpdateResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveUpdateParams } from './resolveUpdateParams'
import clone from 'just-clone'
import { OnUpdatedMessage, OnUpdatingMessage } from '../broadcasting/BroadcastMessages'
import { getDriverKey } from '../utils/getDriverKey'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { deepmerge } from 'deepmerge-ts'
import { Form } from '../types/Form'

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
  form: Form<InstanceType<T>> | LoosePrimaryKey,
  options?: UpdateOptions<T> | Form<InstanceType<T>>,
  hasDriverOptions?: UpdateOptions<T>,
): Promise<UpdateResponse<T>> {
  const params = resolveUpdateParams<T>(ModelClass, id, form, options, hasDriverOptions)
  const driverKey = getDriverKey(params.options.driver)

  const driver = getDriverFunction('update', driverKey) as Update<T>

  const driverConfig = getMergedDriverConfig(driverKey)

  const entity = params.ModelClass.entity

  const updatingHooks = deepmerge(driverConfig.hooks?.updating ?? [])
  const updatedHooks = deepmerge(driverConfig.hooks?.updated ?? [])

  const updatingChannel = new BroadcastChannel(`vuemodel.${driverKey}.updating`)
  const updatedChannel = new BroadcastChannel(`vuemodel.${driverKey}.updated`)
  const updatingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.updating`)
  const updatedEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.updated`)

  const updatingPostMessage: OnUpdatingMessage<T> = clone({ entity, form: params.form, id: params.id })

  updatingHooks.forEach(async hook => await hook({ ModelClass: params.ModelClass, entity, form: params.form, id: params.id }))

  updatingChannel.postMessage(updatingPostMessage)
  updatingEntityChannel.postMessage(updatingPostMessage)

  return driver(
    params.ModelClass,
    params.id,
    params.form,
    params.options,
  ).then(response => {
    if (response.success) {
      const updatedPostMessage: OnUpdatedMessage<T> = clone({ entity, response })

      updatedHooks.forEach(async hook => await hook({ ModelClass: params.ModelClass, entity, response }))

      updatedChannel.postMessage(updatedPostMessage)
      updatedEntityChannel.postMessage(updatedPostMessage)
    }
    return response
  })
}
