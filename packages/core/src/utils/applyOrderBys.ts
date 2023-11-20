import { Model, OrderBy, OrderDirection, Query } from 'pinia-orm'
import { Order } from '../contracts/crud/index/IndexOrders'

const orderByDirectionMap: Record<string, OrderDirection> = {
  ascending: 'asc',
  descending: 'desc',
}

export function applyOrderBys<T extends Model> (
  query: Query,
  orderBys: Order<T>[],
) {
  orderBys.forEach(orderBy => {
    query.orderBy(orderBy.field as OrderBy, orderByDirectionMap[orderBy.direction])
  })
}
