import { Model, Query, Relation } from 'pinia-orm'
import { applyFilters } from './applyFilters'
import { applyOrderBys } from './applyOrderBys'
import { pick } from './pick'
import { resolveScopes } from '../drivers/resolveScopes'
import { deepmerge } from 'deepmerge-ts'
import { Constructor } from '../types/Constructor'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { vueModelState } from '../plugin/state'
import { UseIndexerOptions } from '../contracts/crud/index/UseIndexer'
import { toValue } from 'vue'
import { getClassAttributes } from './getClassAttributes'
import { getClassRelationships } from './getClassRelationships'

export function applyWiths<T extends Model> (
  ModelClass: Constructor<T>,
  query: Query,
  withParam: IndexWiths<T>,
  options?: {
    driver?: string,
    withoutGlobalScopes?: UseIndexerOptions<typeof Model>['withoutGlobalScopes'],
    withoutEntityGlobalScopes?: UseIndexerOptions<typeof Model>['withoutEntityGlobalScopes']
  },
): void {
  (Object.entries(withParam)).forEach(([related, relatedOptions]) => {
    query.with(String(related), relatedQuery => {
      const relatedFields = (new ModelClass()).$fields()
      const relatedAttribute = relatedFields[related as keyof typeof relatedFields] as Relation
      const RelatedClass = relatedAttribute.related.constructor as typeof Model
      const fields = getClassAttributes(RelatedClass)
      const relationships = getClassRelationships(RelatedClass)

      const resolvedScopes = resolveScopes(
        RelatedClass,
        options?.driver ?? vueModelState.default ?? 'default',
        RelatedClass.entity,
        undefined,
        {
          withoutGlobalScopes: toValue(options?.withoutGlobalScopes),
          withoutEntityGlobalScopes: toValue(options?.withoutEntityGlobalScopes),
        },
      )

      const relatedsFilters = deepmerge(
        pick(relatedOptions, [...Object.keys(fields), 'and', 'or']),
        resolvedScopes.filters ?? {},
      )
      const relatedsWiths = deepmerge(
        pick(relatedOptions, Object.keys(relationships)),
        resolvedScopes.with ?? {},
      )
      const relatedsOrderBys = [
        ...(relatedOptions?._orderBy ?? []),
        ...(resolvedScopes.orderBy ?? []),
      ]

      applyFilters(relatedQuery, relatedsFilters)
      applyWiths(RelatedClass, relatedQuery, relatedsWiths)
      applyOrderBys(relatedQuery, relatedsOrderBys)
    })
  })
}
