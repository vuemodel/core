import { getDriverFunction } from '../getDriverFunction'
import { Create, CreateOptions } from '../contracts/crud/create/Create'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../types/Response'
import { resolveCreateParams } from './resolveCreateParams'
import clone from 'just-clone'
import { OnCreatedMessage, OnCreatingMessage } from '../types/BroadcastMessages'
import { getDriverKey } from '../utils/getDriverKey'

/**
 * Create a record on the "backend".
 *
 * @param ModelClass The PiniaORM model
 * @param form Object used to create the record
 * @param options additional options
 *
 * @example
 * import { Post } from 'modules/Post/Post'
 *
 * const response = await create(Post, {
 *   title: 'Once upon a time...',
 * })
 */
export function create<T extends typeof Model> (
  ModelClass: T | string,
  form: PiniaOrmForm<InstanceType<T>> | T,
  options?: CreateOptions<T> | PiniaOrmForm<InstanceType<T>>,
  hasDriverOptions?: CreateOptions<T>,
): Promise<CreateResponse<T>> {
  const params = resolveCreateParams<T>(ModelClass, form, options, hasDriverOptions)
  const driverKey = getDriverKey(params.options.driver)

  const driver = getDriverFunction('create', driverKey) as Create<T>

  const entity = params.ModelClass.entity

  const creatingChannel = new BroadcastChannel(`vuemodel.${driverKey}.creating`)
  const createdChannel = new BroadcastChannel(`vuemodel.${driverKey}.created`)

  const creatingEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.creating`)
  const createdEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${entity}.created`)

  const creatingPostMessage: OnCreatingMessage<T> = clone({ entity, form: params.form })

  creatingChannel.postMessage(creatingPostMessage)
  creatingEntityChannel.postMessage(creatingPostMessage)

  return driver(params.ModelClass, params.form, params.options)
    .then(response => {
      const createdPostMessage: OnCreatedMessage<T> = clone({ entity, response })
      createdChannel.postMessage(createdPostMessage)
      createdEntityChannel.postMessage(createdPostMessage)
      return response
    })
}
