import { Model, Relation, BelongsToMany, HasMany, HasManyBy, HasManyThrough, HasOne, BelongsTo, MorphMany, MorphOne, MorphTo, MorphToMany } from 'pinia-orm'
import { FilterPiniaOrmModelToRelationshipTypes } from '../types/FilterPiniaOrmModelToRelationshipTypes'

export type RelationshipDefinition = Relation &
  (
    BelongsToMany & { kind: 'BelongsToMany' } |
    HasMany & { kind: 'HasMany' } | 
    HasManyBy & { kind: 'HasManyBy' } | 
    HasManyThrough & { kind: 'HasManyThrough' } | 
    HasOne & { kind: 'HasOne' } | 
    BelongsTo & { kind: 'BelongsTo' } | 
    MorphMany & { kind: 'MorphMany' } | 
    MorphOne & { kind: 'MorphOne' } | 
    MorphTo & { kind: 'MorphTo' } | 
    MorphToMany & { kind: 'MorphToMany' }
  )
  & { isRelationship: boolean, key: string }

export function getClassRelationships<ModelType extends typeof Model> (
  PiniaOrmClass: ModelType,
) {
  const fields = (new PiniaOrmClass()).$fields()

  return Object.fromEntries(Object.entries(fields)
    .map(([key, schema]) => {
      const definition = {
        ...schema,
        kind: schema.constructor.name,
        isRelationship: schema instanceof Relation,
        key,
      }
      return [key, definition]
    })
    .filter(([_key, schema]) => typeof schema === 'object' ? schema.isRelationship : false)) as Record<
      keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<ModelType>>,
      RelationshipDefinition
    >
}
