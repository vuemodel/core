import { Model, Query } from 'pinia-orm'
import { IndexFilters, FilterTypeToValueBase } from '@vuemodel/core'
import { whereFunctions } from './whereFunctions'

type FilterGroup = Partial<Record<keyof Model, FilterTypeToValueBase | FilterTypeToValueBase[]>>[]

function executeFilterBlock (record: Model, filterGroups: FilterGroup): boolean[] {
  const result: boolean[] = []
  filterGroups.forEach(filterGroup => {
    Object.entries(filterGroup).forEach(([field, filters]) => {
      if (field === 'and' || field === 'or') {
        // Handle nested and/or
        const nestedResult = executeFilterBlock(record, filters as FilterGroup)
        const value = field === 'and' ? nestedResult.every(Boolean) : nestedResult.some(Boolean)
        result.push(value)
      } else {
        // Handle field filters
        Object.entries(filters as FilterTypeToValueBase).forEach(([action, compareValue]) => {
          const whereFunction = whereFunctions[action]
          if (typeof whereFunction === 'function') {
            result.push(whereFunction(record[field], compareValue))
          }
        })
      }
    })
  })
  return result
}

export function applyFilters (query: Query, filters: IndexFilters<InstanceType<typeof Model>>) {
  Object.entries(filters).forEach(([field, actions]) => {
    // Handle or
    if (field === 'or') {
      query.where((record: Model) => {
        return executeFilterBlock(record, actions as FilterGroup).some(Boolean)
      })
      return
    }

    // Handle and
    if (field === 'and') {
      query.where((record: Model) => {
        return executeFilterBlock(record, actions as FilterGroup).every(Boolean)
      })
      return
    }

    // Handle Field
    Object.entries(actions as FilterTypeToValueBase).forEach(([action, compareValue]) => {
      const whereFunction = whereFunctions[action]
      if (typeof whereFunction === 'function') {
        query.where(field, (val: any) => whereFunction(val, compareValue))
      }
    })
  })
}
