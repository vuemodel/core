import { Model } from 'pinia-orm'
import { FilterPiniaOrmModelToRelationshipTypes } from 'pinia-orm-helpers'
import { IndexResourcesFilters } from './IndexResourcesFilters'
import { SortBy } from './IndexResourcesSorts'

type ExcludeNullable<T> = T extends null | undefined ? never : T;
type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

export type IncludeTypeToValue<T extends typeof Model> = {
    [K in keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>]?: IndexResourcesIncludesInternal<ExcludeNullable<UnwrapType<InstanceType<T>[K]>>>
  } & { _sortBy?: SortBy<T> }
    & { _limit?: number };

export type IndexResourcesIncludesInternal <T extends typeof Model> = IncludeTypeToValue<T> & IndexResourcesFilters<T>;

export type IndexResourcesIncludes <T extends typeof Model> = { [K in keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>]?: IncludeTypeToValue<T>[K] }
