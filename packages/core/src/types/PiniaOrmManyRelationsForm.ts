import { Model } from 'pinia-orm'
import { FilterPiniaOrmModelToManyRelationshipTypes } from './FilterPiniaOrmModelToManyRelationshipTypes'

export type PiniaOrmManyRelationsForm<
  T extends Model,
> = {
  [
    K in keyof FilterPiniaOrmModelToManyRelationshipTypes<T>
  ]?: string[] | number[] | Record<string, any>
}
