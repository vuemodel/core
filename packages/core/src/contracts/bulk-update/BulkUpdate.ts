import { Model } from 'pinia-orm'
import { BulkUpdateErrorResponse, BulkUpdateResponse } from '../../types/Response'
import { Form } from '../../types/Form'

export interface BulkUpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: BulkUpdateErrorResponse<T>) => boolean)
}

export type BulkUpdate<T extends typeof Model> = (
  ModelClass: T,
  forms: Record<string | number, Form<InstanceType<T>>>,
  options?: BulkUpdateOptions<T>
) => Promise<BulkUpdateResponse<T>>
