import { FilterPiniaOrmModelToRelationshipTypes } from 'pinia-orm-helpers'
import { Model } from 'pinia-orm'

type ExcludeNullable<T> = T extends null | undefined ? never : T;
type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

type FilterTypeParamType = [
  ['equals', string | number],
  ['doesNotEqual', string | number],
  ['lessThan', string | number],
  ['lessThanOrEqual', string | number],
  ['greaterThan', string | number],
  ['greaterThanOrEqual', string | number],
  ['in', (string | number)[]],
  ['notIn', (string | number)[]],
  ['contains', string],
  ['doesNotContain', string],
  ['between', [string | number | Date, string | number | Date]],
  ['startsWith', string | number],
  ['endsWith', string | number]
]

type FilterType = FilterTypeParamType[number][0];

type FilterTypeToValueBase = {
  [K in FilterType]?: Extract<FilterTypeParamType[number], [K, any]>[1];
};

type FilterTypeToValue = {
  [K: string]: IndexFiltersLoose | FilterTypeToValueBase | LogicalOperatorFilters
}

type LogicalOperatorFilters = {
  or?: Partial<Record<string, FilterTypeToValueBase>>[]
  and?: Partial<Record<string, FilterTypeToValueBase>>[]
}

type _RelationshipFilter<
  // comments
  relationshipKey extends keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>,
  // Post
  T extends typeof Model
> = Record<
  // "comments" relationships
  keyof FilterPiniaOrmModelToRelationshipTypes<ExcludeNullable<UnwrapType<InstanceType<T>[relationshipKey]>>>,
  // the "Comment" class
  ExcludeNullable<UnwrapType<InstanceType<T>[relationshipKey]>>
>

// Define IndexFiltersLoose after FilterTypeToValue so that it can reference it
export type IndexFiltersLoose = FilterTypeToValue;
