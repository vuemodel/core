import { Model } from 'pinia-orm'
import { IndexResourcesFilters } from './IndexResourcesFilters'
import { SortBy } from './IndexResourcesSorts'
import { IndexResourcesIncludes } from './IndexResourcesIncludes'
import { IndexResourcesPagination } from './IndexResourcesPagination'
import { IndexResponse } from '../../../types/ResourceResponse'

export interface IndexResourcesOptions<T extends typeof Model> {
  driver?: string
  includes?: IndexResourcesIncludes<T> | undefined
  filters?: IndexResourcesFilters<T> | undefined
  sortBy?: SortBy<T> | undefined
  pagination?: IndexResourcesPagination | undefined
  notifyOnError?: boolean | undefined
}

export type IndexResources<T extends typeof Model> = (
  EntityClass: T,
  options?: IndexResourcesOptions<T>
) => Promise<IndexResponse<T>>
