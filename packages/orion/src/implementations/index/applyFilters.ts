import { Model } from 'pinia-orm'
import { IndexFilters, FilterTypeToValueBase } from '@vuemodel/core'
import { getClassAttributes, getClassRelationships } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { operatorMap } from './operatorMap'
import { Constructor } from '../../types/Constructor'

export function applyFilters<T extends Model> (
  ModelClass: Constructor<T>,
  query: any,
  filters: IndexFilters<InstanceType<typeof Model>>,
  options: {
    isOrBlock?: boolean
    isAndBlock?: boolean
    path?: string
  } = {},
) {
  const fields = getClassAttributes(ModelClass)
  const relationships = getClassRelationships(ModelClass)

  Object.entries(filters).forEach(([field, actions]) => {
    const fieldWithPath = options.path ? (options.path + '.' + field) : field
    // Handle or
    if (field === 'or') {
      const nestedQuery = { filters: [] }
      for (const action of actions) {
        applyFilters(ModelClass, nestedQuery, action, { isOrBlock: true })
      }
      query.filters.push({
        type: 'and',
        nested: nestedQuery.filters,
      })

      return
    }

    // Handle and
    if (field === 'and') {
      const nestedQuery = { filters: [] }
      for (const action of actions) {
        applyFilters(ModelClass, nestedQuery, action, { isAndBlock: true })
      }
      query.filters.push({
        type: 'and',
        nested: nestedQuery.filters,
      })

      return
    }

    // Handle Field
    if (fields[field]) {
      Object.entries(actions as FilterTypeToValueBase).forEach(([action, compareValue]) => {
        const operator = operatorMap[action]

        if (typeof operator === 'function') {
          const filters = operator(fieldWithPath, compareValue)
          query.filters.push(...filters)
          return
        }

        const filter = {
          field: fieldWithPath,
          operator: operator.operator,
          value: operator.transformValue ? operator.transformValue(compareValue) : compareValue,
        }

        if (options.isOrBlock) filter.type = 'or'
        if (options.isAndBlock) filter.type = 'and'

        query.filters.push(filter)

        // const whereFunction = whereFunctions[action]
        // if (typeof whereFunction === 'function') {
        //   query.where(field, (val: any) => whereFunction(val, compareValue))
        // }
      })
    }

    // Handle Relationship
    if (relationships[field]) {
      const relatedsWiths = pick(filters, Object.keys(relationships))

      Object.entries(relatedsWiths as FilterTypeToValueBase).forEach(([related, relatedsFilters]) => {
        const path = options.path ? (options.path + '.' + related) : related

        applyFilters(relationships[field].related.constructor, query, relatedsFilters, { path })
      })
    }
  })
}
