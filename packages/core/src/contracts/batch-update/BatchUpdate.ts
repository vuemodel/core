import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateErrorResponse, BatchUpdateResponse } from '../../types/Response'

export interface BatchUpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: BatchUpdateErrorResponse<T>) => boolean)
}

export type BatchUpdate<T extends typeof Model> = (
  ModelClass: T,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  options?: BatchUpdateOptions<T>
) => Promise<BatchUpdateResponse<T>>
