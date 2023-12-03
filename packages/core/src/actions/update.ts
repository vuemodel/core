import { getImplementation } from '../getImplementation'
import { Update, UpdateOptions } from '../contracts/crud/update/Update'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { resolveParams } from './resolveParams'

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
): Promise<UpdateResponse<T>> {
  const params = resolveParams(ModelClass, id, form, options)
  const driver = typeof ModelClass === 'string' ? ModelClass : (options as UpdateOptions<T>)?.driver

  const implementation = getImplementation('update', driver) as Update<T>

  return implementation(...(params as [T, LoosePrimaryKey, PiniaOrmForm<InstanceType<T>>, UpdateOptions<T>]))
}
