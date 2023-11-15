import { Model } from 'pinia-orm'
import { IndexResourcesIncludes } from '@vuemodel/core'
import { getClassRelationships } from 'pinia-orm-helpers'
import { Entries } from '../types/Entries'
import { pick } from './pick'
import { IndexResourcesFiltersLoose } from '../contracts/crud/index/IndexResourcesFiltersLoose'

function resolveGlobalFilters (entity: string, driver: string) {

}

export function applyGlobalFiltersToIncludesObject<T extends typeof Model> (
  EntityClass: T,
  includes: IndexResourcesIncludes<T>,
  globalFilters: IndexResourcesFiltersLoose,
  driver: string,
) {
  (Object.entries(includes) as Entries<IndexResourcesIncludes<T>>).forEach(([related, relatedOptions]) => {
    const relatedFields = (new EntityClass()).$fields()
    const RelatedClass = relatedFields[related as keyof typeof relatedFields].related.constructor as typeof Model
    const relationships = getClassRelationships(RelatedClass)

    const filters
    const relatedsIncludes = pick(relatedOptions, Object.keys(relationships))

    applyGlobalFiltersToIncludesObject(RelatedClass, relatedsIncludes)
  })
}
