import { getImplementation } from '../getImplementation'
import { Create, CreateOptions } from '../contracts/crud/create/Create'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../types/Response'
import { resolveParams } from './resolveParams'

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
  const params = resolveParams(ModelClass, form, options, hasDriverOptions)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as CreateOptions<T>)?.driver

  const implementation = getImplementation('create', driver) as Create<T>

  return implementation(...(params as [T, PiniaOrmForm<InstanceType<T>>, CreateOptions<T>]))
}
