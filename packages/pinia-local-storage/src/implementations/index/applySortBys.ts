import { Model, OrderDirection, Query } from 'pinia-orm'
import { Sort } from '@vuemodel/core'

const sortByDirectionMap: Record<string, OrderDirection> = {
  ascending: 'asc',
  descending: 'desc',
}

export function applySortBys<T extends typeof Model> (query: Query, sortBys: Sort<T>[]) {
  sortBys.forEach(sortBy => {
    query.orderBy(sortBy.field, sortByDirectionMap[sortBy.direction])
  })
}
