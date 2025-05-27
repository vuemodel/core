import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from './DeclassifyPiniaOrmModel'
import { FilterPiniaOrmModelToRelationshipTypes } from './FilterPiniaOrmModelToRelationshipTypes'

export type Form<T extends Model> = Partial<
  Omit<
    DeclassifyPiniaOrmModel<T>,
    keyof FilterPiniaOrmModelToRelationshipTypes<T>
  >
>
