import { Model, Relation, useRepo } from 'pinia-orm'
import { orionState } from '../plugin/state'
import { get as getItem } from 'idb-keyval'
import { getClassRelationships, IndexWiths } from '@vuemodel/core'
import { pick } from './pick'
import { Constructor } from '../types/Constructor'

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
    if (!RelatedClass) return
    const relationships = getClassRelationships(RelatedClass)
    const relatedsWiths = pick(relatedOptions, Object.keys(relationships))
    entitiesAccumulator[related as string] = RelatedClass

    discoverEntities(RelatedClass, relatedsWiths, entitiesAccumulator)
  })

  return entitiesAccumulator
}

export async function ensureModelRecordsInStore<T extends typeof Model> (
  ModelClass: T,
  withParam: IndexWiths<InstanceType<T>> = {},
) {
  const entities = discoverEntities(ModelClass, withParam)
  entities[ModelClass.entity] = ModelClass
  for (const entry of Object.entries(entities)) {
    const repo = useRepo(entry[1] as typeof Model, orionState.store)
    const recordsKey = `${entry[1].entity}.records`
    const records = (await getItem(recordsKey)) ?? {}
    repo.insert(Object.values(records))
  }
}
