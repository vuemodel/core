import { Model, Query } from 'pinia-orm'
import { IndexFilters, FilterTypeToValueBase } from '@vuemodel/core'
import { whereFunctions } from './whereFunctions'

function executeFilterBlock (record: Model, filterGroups: Partial<Record<keyof Model, FilterTypeToValueBase>>[]) {
  const result: boolean[] = []
  filterGroups.forEach(filterGroup => {
    Object.entries(filterGroup).forEach(filterGroupEntry => {
      const field = filterGroupEntry[0]
      const filters = filterGroupEntry[1]

      Object.entries(filters ?? {}).forEach(filterEntry => {
        const whereFunction = whereFunctions[filterEntry[0]]
        const compareValue = filterEntry[1]
        result.push(whereFunction(record[field], compareValue))
      })
    })
  })

  return result
}

export function applyFilters (query: Query, filters: IndexFilters<Model>) {
  Object.entries(filters).forEach(entry => {
    const field = entry[0]
    const actions = entry[1]

    // Handle or
    if (field === 'or') {
      query.where((record: Model) => {
        return executeFilterBlock(record, actions).some(val => !!val)
      })
    }

    // Handle and
    if (field === 'and') {
      query.where((record: Model) => {
        return executeFilterBlock(record, actions).every(val => !!val)
      })
    }

    // Handle Field
    Object.entries(actions).forEach(entry => {
      const action = entry[0]
      const compareValue = entry[1]
      const whereFunction = whereFunctions[action]

      if (whereFunction) {
        query.where(field, (val: any) => whereFunction(val, compareValue))
      }
    })
  })
}
