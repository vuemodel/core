import { Model, OrderDirection, Query } from 'pinia-orm'
import { Order } from '@vuemodel/core'

const orderByDirectionMap: Record<string, OrderDirection> = {
  ascending: 'asc',
  descending: 'desc',
}

export function applyOrderBys<T extends Model> (
  query: any,
  orderBys: Order<T>[],
) {
  orderBys.forEach(orderBy => {
    query.sort.push({
      field: orderBy.field,
      direction: orderByDirectionMap[orderBy.direction],
    })
  })
}
