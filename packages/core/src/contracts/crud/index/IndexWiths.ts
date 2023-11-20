import { Model } from 'pinia-orm'
import { FilterPiniaOrmModelToRelationshipTypes } from 'pinia-orm-helpers'
import { IndexFilters } from './IndexFilters'
import { OrderBy } from './IndexOrders'

type ExcludeNullable<T> = T extends null | undefined ? never : T;
type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

export type WithTypeToValue<T extends Model> = {
    [K in keyof FilterPiniaOrmModelToRelationshipTypes<T>]?: IndexWithsInternal<
      ExcludeNullable<UnwrapType<T[K]>>
    >
  } & { _orderBy?: OrderBy<T> }
    & { _limit?: number };

export type IndexWithsInternal <T extends Model> = WithTypeToValue<T> & IndexFilters<T>;

export type IndexWiths <T extends Model> = { [K in keyof FilterPiniaOrmModelToRelationshipTypes<T>]?: WithTypeToValue<T>[K] } | string | string[]
