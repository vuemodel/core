import { BelongsTo, Database, HasMany, Model, Relation, useRepo } from 'pinia-orm'
import { piniaLocalStorageState } from '../plugin/state'
import { get as getItem } from 'idb-keyval'
import { Entries } from './Entries'
import { IndexResourcesIncludes } from '@vuemodel/core'
import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
import { pick } from './pick'

// const insertedModels: Record<string, boolean> = {}

export function discoverEntities<T extends typeof Model> (
  EntityClass: T,
  includes: IndexResourcesIncludes<T>,
  entitiesAccumulator: Record<string, typeof Model> = {} as Record<string, typeof Model>
) {
  (Object.entries(includes) as Entries<IndexResourcesIncludes<T>>).forEach(([related, relatedOptions]) => {
    const relatedFields = (new EntityClass).$fields()
    const RelatedClass = relatedFields[related as keyof typeof relatedFields].related.constructor as typeof Model
    const relationships = getClassRelationships(RelatedClass)
    const relatedsIncludes = pick(relatedOptions, Object.keys(relationships))
    entitiesAccumulator[related as string] = RelatedClass


    discoverEntities(RelatedClass, relatedsIncludes, entitiesAccumulator)
  })

  return entitiesAccumulator
}

export async function ensureModelRecordsInStore<T extends typeof Model> (
  EntityClass: T,
  includes: IndexResourcesIncludes<T> = {},
) {
  const entities = discoverEntities(EntityClass, includes)
  entities[EntityClass.entity] = EntityClass
  for (const entry of Object.entries(entities)) {
    const repo = useRepo(entry[1] as typeof Model, piniaLocalStorageState.store)
    const recordsKey = `${entry[0]}.records`
    const records = (await getItem(recordsKey)) ?? {}
    repo.insert(Object.values(records))
  }
}
