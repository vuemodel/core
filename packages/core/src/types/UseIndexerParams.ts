import { IndexFilters } from '../contracts/crud/index/IndexFilters'
import { Model } from 'pinia-orm'

export type IndexIdsParam = (string | number | string[] | number[])[]
export type IndexOptionsParam<T extends typeof Model> = {
  page?: number,
  recordsPerPage?: number
  filters?: IndexFilters<InstanceType<T>>
}
