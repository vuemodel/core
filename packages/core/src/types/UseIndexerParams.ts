import { IndexFilters } from '../contracts/crud/index/IndexFilters'
import { Model } from 'pinia-orm'
import { OrderBy } from '../contracts/crud/index/IndexOrders'

export type IndexIdsParam = (string | number | string[] | number[])[]
export type IndexOptionsParam<T extends typeof Model> = {
  page?: number,
  recordsPerPage?: number
  filters?: IndexFilters<InstanceType<T>>
  orderBy?: OrderBy<InstanceType<T>>
}
