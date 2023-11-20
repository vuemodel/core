import { Model } from 'pinia-orm'
import { IndexFilters } from './IndexFilters'
import { OrderBy } from './IndexOrders'
import { IndexWiths } from './IndexWiths'
import { IndexPagination } from './IndexPagination'
import { IndexResponse } from '../../../types/Response'

export interface IndexOptions<T extends typeof Model> {
  driver?: string
  with?: IndexWiths<InstanceType<T>> | undefined
  filters?: IndexFilters<InstanceType<T>> | undefined
  orderBy?: OrderBy<InstanceType<T>> | undefined
  pagination?: IndexPagination | undefined
  notifyOnError?: boolean | undefined
  signal?: AbortController['signal']
  throw?: boolean | ((response?: IndexResponse<T>) => boolean)
}

export type Index<T extends typeof Model> = (
  ModelClass: T,
  options?: IndexOptions<T>
) => Promise<IndexResponse<T>>
