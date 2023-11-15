import { Model, Query } from 'pinia-orm'
import { IndexResourcesIncludes, vueModelState } from '@vuemodel/core'
import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
import { applyFilters } from './applyFilters'
import { applySortBys } from './applySortBys'
import { Entries } from '../types/Entries'
import { pick } from './pick'
import { resolveScopes } from '../implementations/resolveScopes'
import deepmerge from 'deepmerge'

export function applyIncludes<T extends typeof Model> (
  EntityClass: T,
  query: Query,
  includes: IndexResourcesIncludes<T>,
  options?: { driver?: string },
) {
  (Object.entries(includes) as Entries<IndexResourcesIncludes<T>>).forEach(([related, relatedOptions]) => {
    query.with(String(related), relatedQuery => {
      const relatedFields = (new EntityClass()).$fields()
      const RelatedClass = relatedFields[related as keyof typeof relatedFields].related.constructor as typeof Model
      // const RelatedClass = query.database.models[related as keyof typeof query.database.models].constructor as typeof Model
      const fields = getClassAttributes(RelatedClass)
      const relationships = getClassRelationships(RelatedClass)

      const resolvedScopes = resolveScopes(
        options?.driver ?? vueModelState.default ?? 'default',
        RelatedClass.entity,
        undefined,
      )

      // console.log(related)
      const relatedsFilters = deepmerge(pick(relatedOptions, [...Object.keys(fields), 'and', 'or']), resolvedScopes.filters)
      const relatedsIncludes = deepmerge(pick(relatedOptions, Object.keys(relationships)), resolvedScopes.includes)
      const relatedsSortBys = [...(relatedOptions?._sortBy ?? []), ...resolvedScopes.sortBy]

      applyFilters(relatedQuery, relatedsFilters)
      applyIncludes(RelatedClass, relatedQuery, relatedsIncludes)
      applySortBys(relatedQuery, relatedsSortBys)
    })
  })
}

// import { Model, Query } from 'pinia-orm'
// import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
// import { applyFilters } from './applyFilters'
// import { IndexResourcesIncludes } from '../contracts/crud/index/IndexResourcesIncludes'
// import { pick } from './pick'
// import { applySortBys } from './applySortBys'

// export function applyIncludes<T extends typeof Model> (query: Query, includes: IndexResourcesIncludes<T>) {
//   Object.entries(includes).forEach(([related, relatedOptions]) => {
//     query.with(related, relatedQuery => {
//       const relatedClass = query.database.models[related].constructor as typeof Model
//       const fields = getClassAttributes(relatedClass)
//       const relationships = getClassRelationships(relatedClass)

//       // console.log(related)
//       const relatedsFilters = pick(relatedOptions, [...Object.keys(fields), 'and', 'or'])
//       const relatedsIncludes = pick(relatedOptions, Object.keys(relationships))
//       const relatedsSortBys = relatedOptions?._sortBy ?? []

//       applyFilters(relatedQuery, relatedsFilters)
//       applyIncludes(relatedQuery, relatedsIncludes as IndexResourcesIncludes<T>)
//       applySortBys(relatedQuery, relatedsSortBys)
//     })
//   })
// }
