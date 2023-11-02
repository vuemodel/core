import { Model, Query } from 'pinia-orm'
import { IndexResourcesIncludes } from '@vuemodel/core'
import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { applyFilters } from './applyFilters'
import { applySortBys } from './applySortBys'

export function applyIncludes<T extends typeof Model> (query: Query, includes: IndexResourcesIncludes<T>) {
  Object.entries(includes).forEach(([related, relatedOptions]) => {
    query.with(related, relatedQuery => {
      const relatedClass = query.database.models[related].constructor as typeof Model
      const fields = getClassAttributes(relatedClass)
      const relationships = getClassRelationships(relatedClass)

      // console.log(related)
      const relatedsFilters = pick(relatedOptions, [...Object.keys(fields), 'and', 'or'])
      const relatedsIncludes = pick(relatedOptions, Object.keys(relationships))
      const relatedsSortBys = relatedOptions?._sortBy ?? []

      applyFilters(relatedQuery, relatedsFilters)
      applyIncludes(relatedQuery, relatedsIncludes as IndexResourcesIncludes<T>)
      applySortBys(relatedQuery, relatedsSortBys)
    })
  })
}
