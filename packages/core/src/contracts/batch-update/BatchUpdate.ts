import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateErrorResponse, BatchUpdateResponse } from '../../types/Response'

export interface UpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  throw?: boolean | ((response?: BatchUpdateErrorResponse<T>) => boolean)
}

export type BatchUpdate<T extends typeof Model> = (
  model: T,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  options?: UpdateOptions<T>
) => Promise<BatchUpdateResponse<T>>
