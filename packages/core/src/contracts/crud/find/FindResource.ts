import { Model } from 'pinia-orm'
import { IndexResourcesIncludes } from '../index/IndexResourcesIncludes'
import { FindResponse } from '../../../types/ResourceResponse'

export interface FindResourceOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  includes?: IndexResourcesIncludes<T>
}

export type FindResource<T extends typeof Model> = (
  EntityClass: T,
  id: string,
  options?: FindResourceOptions<T>
) => Promise<FindResponse<T>>
