import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from './DeclassifyPiniaOrmModel'

export type FilterPiniaOrmModelToRelationshipTypes<T extends Model> = Pick<DeclassifyPiniaOrmModel<T>, {
  [K in keyof DeclassifyPiniaOrmModel<T>]: DeclassifyPiniaOrmModel<T>[K] extends Model | null | Model[] ? K : never;
}[keyof DeclassifyPiniaOrmModel<T>]>;
