import { getImplementation } from '../getImplementation'
import { Update, UpdateOptions } from '../contracts/crud/update/Update'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

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
  ModelClass: T,
  id: LoosePrimaryKey,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: UpdateOptions<T>,
): Promise<UpdateResponse<T>> {
  const implementation = getImplementation('update', options?.driver) as Update<T>

  return implementation(ModelClass, id, form, options)
}
