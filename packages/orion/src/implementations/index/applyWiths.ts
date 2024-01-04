import { Model, Relation } from 'pinia-orm'
import { IndexWiths } from '@vuemodel/core'
import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { applyFilters } from './applyFilters'
import { Constructor } from '../../types/Constructor'

export function applyWiths<T extends Model> (
  ModelClass: Constructor<T>,
  query: any,
  withParam: IndexWiths<T>,
  driverKey: string,
  path: string = '',
) {
  (Object.entries(withParam)).forEach(([related, relatedOptions]) => {
    const relatedFields = (new ModelClass()).$fields()
    const relatedAttribute = relatedFields[related as keyof typeof relatedFields] as Relation
    const RelatedClass = relatedAttribute.related.constructor as typeof Model
    const fields = getClassAttributes(RelatedClass)
    const relationships = getClassRelationships(RelatedClass)
    const relatedsFilters = pick(relatedOptions, [...Object.keys(fields), 'and', 'or'])
    const relatedsWiths = pick(relatedOptions, Object.keys(relationships))
    const relatedsOrderBys = relatedOptions?._orderBy ?? []

    const relatedWithPath = path ? `${path}.${related}` : related

    const relationQuery = {
      relation: relatedWithPath,
      includes: [],
      filters: [],
      sort: [],
    }

    applyFilters(RelatedClass, relationQuery, relatedsFilters)
    if (relatedsOrderBys.length) {
      console.warn(`implementation "${driverKey}" does not support feature "find.order.nested"`)
    }

    applyWiths(RelatedClass, query, relatedsWiths, driverKey, relatedWithPath)

    query.includes.push(relationQuery)
  })
}
