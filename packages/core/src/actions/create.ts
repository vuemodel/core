import { getImplementation } from '../getImplementation'
import { Create, CreateOptions } from '../contracts/crud/create/Create'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../types/Response'

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
  ModelClass: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: CreateOptions<T>,
): Promise<CreateResponse<T>> {
  const implementation = getImplementation('create', options?.driver) as Create<T>

  return implementation(ModelClass, form, options)
}
