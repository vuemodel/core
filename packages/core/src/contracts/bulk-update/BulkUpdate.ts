import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BulkUpdateErrorResponse, BulkUpdateResponse } from '../../types/Response'

export interface BulkUpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: BulkUpdateErrorResponse<T>) => boolean)
}

export type BulkUpdate<T extends typeof Model> = (
  ModelClass: T,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  options?: BulkUpdateOptions<T>
) => Promise<BulkUpdateResponse<T>>
