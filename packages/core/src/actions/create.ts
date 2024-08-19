import { getImplementation } from '../getImplementation'
import { Create, CreateOptions } from '../contracts/crud/create/Create'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../types/Response'
import { resolveCreateParams } from './resolveCreateParams'

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
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as CreateOptions<T>)?.driver

  const implementation = getImplementation('create', driver) as Create<T>

  const entity = params.ModelClass.entity

  const creatingChannel = new BroadcastChannel(`vuemodel.${driver}.creating`)
  const createdChannel = new BroadcastChannel(`vuemodel.${driver}.created`)
  const creatingEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.creating`)
  const createdEntityChannel = new BroadcastChannel(`vuemodel.${driver}.${entity}.created`)

  const creatingPostMessage = { entity, form }

  creatingChannel.postMessage(creatingPostMessage)
  creatingEntityChannel.postMessage(creatingPostMessage)

  return implementation(params.ModelClass, params.form, params.options)
    .then(response => {
      const createdPostMessage = { entity, response }
      createdChannel.postMessage(createdPostMessage)
      createdEntityChannel.postMessage(createdPostMessage)
      return response
    })
}
