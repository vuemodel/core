import { FilterPiniaOrmModelToRelationshipTypes, FilterPiniaOrmModelToFieldTypes } from 'pinia-orm-helpers'
import { Model } from 'pinia-orm'

type ExcludeNullable<T> = T extends null | undefined ? never : T;
type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

export type FilterTypeParamType = [
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

export type FilterType = FilterTypeParamType[number][0];

export type FilterTypeToValueBase = {
  [K in FilterType]?: Extract<FilterTypeParamType[number], [K, any]>[1];
};

export type FilterTypeToValue<T extends typeof Model> = {
  [K in keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>]?: IndexResourcesFilters<ExcludeNullable<UnwrapType<InstanceType<T>[K]>>>
} & {
    [K in keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>]?: FilterTypeToValueBase
  } & LogicalOperatorFilters<T>

export type LogicalOperatorFilters<T extends typeof Model> = {
  or?: Partial<Record<keyof InstanceType<T>, FilterTypeToValueBase>>[]
  and?: Partial<Record<keyof InstanceType<T>, FilterTypeToValueBase>>[]
}

export type _RelationshipFilter<
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

export type RelationshipFilter<
  // comments
  relationshipKey extends keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>,
  // Post
  T extends typeof Model
> = {
    [
    key in keyof FilterPiniaOrmModelToRelationshipTypes<ExcludeNullable<UnwrapType<InstanceType<T>[relationshipKey]>>>
    ]: _RelationshipFilter<key, ExcludeNullable<UnwrapType<InstanceType<T>[relationshipKey]>>>
  }

// Define IndexResourcesFilters after FilterTypeToValue so that it can reference it
export type IndexResourcesFilters<T extends typeof Model> = FilterTypeToValue<T>;
