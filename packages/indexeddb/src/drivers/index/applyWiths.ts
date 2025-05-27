import { Model, Query, Relation } from 'pinia-orm'
import { getClassAttributes, getClassRelationships, IndexWiths } from '@vuemodel/core'
import { pick } from '../../utils/pick'
import { applyFilters } from './applyFilters'
import { applyOrderBys } from './applyOrderBys'
import { Constructor } from '../../types/Constructor'

export function applyWiths<T extends Model> (
  ModelClass: Constructor<T>,
  query: Query,
  withParam: IndexWiths<T>,
) {
  (Object.entries(withParam)).forEach(([related, relatedOptions]) => {
    query.with(String(related), relatedQuery => {
      const relatedFields = (new ModelClass()).$fields()
      const relatedAttribute = relatedFields[related as keyof typeof relatedFields] as Relation
      const RelatedClass = relatedAttribute.related.constructor as typeof Model
      // const RelatedClass = query.database.models[related as keyof typeof query.database.models].constructor as typeof Model
      const fields = getClassAttributes(RelatedClass)
      const relationships = getClassRelationships(RelatedClass)

      const relatedsFilters = pick(relatedOptions, [...Object.keys(fields), 'and', 'or'])
      const relatedsWiths = pick(relatedOptions, Object.keys(relationships))
      const relatedsOrderBys = relatedOptions?._orderBy ?? []

      applyFilters(relatedQuery, relatedsFilters)
      applyWiths(RelatedClass, relatedQuery, relatedsWiths)
      applyOrderBys(relatedQuery, relatedsOrderBys)
    })
  })
}
