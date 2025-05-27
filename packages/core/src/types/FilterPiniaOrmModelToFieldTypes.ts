import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from './DeclassifyPiniaOrmModel'
import { FilterPiniaOrmModelToRelationshipTypes } from './FilterPiniaOrmModelToRelationshipTypes'

export type FilterPiniaOrmModelToFieldTypes<T extends Model> = Omit<
  DeclassifyPiniaOrmModel<T>,
  keyof FilterPiniaOrmModelToRelationshipTypes<T>
>