import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from './DeclassifyPiniaOrmModel';

export type FilterPiniaOrmModelToHasOneRelationshipTypes<T extends Model> = Pick<DeclassifyPiniaOrmModel<T>, {
  [K in keyof DeclassifyPiniaOrmModel<T>]: DeclassifyPiniaOrmModel<T>[K] extends Model | null | (Model | null) ? K : never;
}[keyof DeclassifyPiniaOrmModel<T>]>;
