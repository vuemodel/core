import { Model, Relation, useRepo } from 'pinia-orm'
import { indexedDbState } from '../plugin/state'
import { getClassRelationships, getDriverKey, IndexWiths } from '@vuemodel/core'
import { pick } from './pick'
import { Constructor } from '../types/Constructor'
import { createIndexedDbRepo } from './createIndexedDbRepo'

// const insertedModels: Record<string, boolean> = {}

export function discoverEntities<T extends Model> (
  ModelClass: Constructor<T>,
  withParam: IndexWiths<T>,
  entitiesAccumulator: Record<string, typeof Model> = {} as Record<string, typeof Model>,
) {
  Object.entries(withParam).forEach(([related, relatedOptions]) => {
    const relatedFields = (new ModelClass()).$fields()
    const relatedAttribute = relatedFields[related as keyof typeof relatedFields] as Relation
    const RelatedClass = relatedAttribute?.related?.constructor as typeof Model
    const RelatedPivot = (relatedAttribute as any)?.pivot?.constructor as typeof Model
    if (!RelatedClass) return
    const relationships = getClassRelationships(RelatedClass)
    const relatedsWiths = pick(relatedOptions, Object.keys(relationships))
    entitiesAccumulator[RelatedClass.entity] = RelatedClass
    if (RelatedPivot) {
      entitiesAccumulator[(RelatedPivot.entity) as string] = RelatedPivot
    }

    discoverEntities(RelatedClass, relatedsWiths, entitiesAccumulator)
  })

  return entitiesAccumulator
}

export async function ensureModelRecordsInStore<T extends typeof Model> (
  ModelClass: T,
  withParam: IndexWiths<InstanceType<T>> = {},
  driver: string | undefined,
) {
  const entities = discoverEntities(ModelClass, withParam)
  entities[ModelClass.entity] = ModelClass
  for (const entry of Object.entries(entities)) {
    const dbPrefix = getDriverKey(driver) + ':'
    const dbRepo = createIndexedDbRepo(entry[1], { prefix: dbPrefix })

    const repo = useRepo(entry[1] as typeof Model, indexedDbState.store)
    const records = (await dbRepo.index()) ?? []
    repo.insert(records)
  }
}
