import { FilterPiniaOrmModelToRelationshipTypes, FilterPiniaOrmModelToFieldTypes } from 'pinia-orm-helpers'
import { Model } from 'pinia-orm'

type ExcludeNullable<T> = T extends null | undefined ? never : T;
type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

export type FilterTypeParamType = [
  ['equals', string | number | boolean | null],
  ['doesNotEqual', string | number | boolean | null],
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

export type FilterTypeToValue<T extends Model> = {
  [K in keyof FilterPiniaOrmModelToRelationshipTypes<T>]?: IndexFilters<ExcludeNullable<UnwrapType<T[K]>>>
} & {
    [K in keyof FilterPiniaOrmModelToFieldTypes<T>]?: FilterTypeToValueBase
  } & LogicalOperatorFilters<T>

export type LogicalOperatorFilters<T extends Model> = {
  or?: { [K in keyof FilterPiniaOrmModelToFieldTypes<T>]?: FilterTypeToValueBase }[]
  and?: { [K in keyof FilterPiniaOrmModelToFieldTypes<T>]?: FilterTypeToValueBase }[]
}

export type _RelationshipFilter<
  // comments
  relationshipKey extends keyof FilterPiniaOrmModelToRelationshipTypes<T>,
  // Post
  T extends Model
> = Record<
  // "comments" relationships
  keyof FilterPiniaOrmModelToRelationshipTypes<ExcludeNullable<UnwrapType<T[relationshipKey]>>>,
  // the "Comment" class
  ExcludeNullable<UnwrapType<T[relationshipKey]>>
>

export type RelationshipFilter<
  // comments
  relationshipKey extends keyof FilterPiniaOrmModelToRelationshipTypes<T>,
  // Post
  T extends Model
> = {
    [
    key in keyof FilterPiniaOrmModelToRelationshipTypes<ExcludeNullable<UnwrapType<T[relationshipKey]>>>
    ]: _RelationshipFilter<key, ExcludeNullable<UnwrapType<T[relationshipKey]>>>
  }

// Define IndexFilters after FilterTypeToValue so that it can reference it
export type IndexFilters<T extends Model> = FilterTypeToValue<T>;
