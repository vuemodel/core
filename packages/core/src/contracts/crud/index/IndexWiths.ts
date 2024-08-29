import { Model } from 'pinia-orm'
import { FilterPiniaOrmModelToRelationshipTypes } from 'pinia-orm-helpers'
import { IndexFilters } from './IndexFilters'
import { OrderBy } from './IndexOrders'

type UnwrapModelType<T> =
  T extends Array<infer U> ? (U extends Model ? U : never) :
  T extends Model | null ? T :
  never;

type ExcludeNullable<T> = T extends null | undefined ? never : T;

export type WithTypeToValue<T extends Model> = {
    [K in keyof FilterPiniaOrmModelToRelationshipTypes<T>]?: IndexWithsInternal<
      ExcludeNullable<UnwrapModelType<T[K]>>
    >
  } & { _orderBy?: OrderBy<T> }
    & { _limit?: number };

export type IndexWithsInternal <T extends Model> = WithTypeToValue<T> & IndexFilters<T>;

export type IndexWiths <T extends Model> = { [K in keyof FilterPiniaOrmModelToRelationshipTypes<T>]?: WithTypeToValue<T>[K] } | string | string[]
