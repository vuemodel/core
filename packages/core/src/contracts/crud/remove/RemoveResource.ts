import { Model } from 'pinia-orm'
import { RemoveResponse } from '../../../types/ResourceResponse'

export interface RemoveResourceOptions {
  driver?: string
  notifyOnError?: boolean
}

export type RemoveResource<T extends typeof Model> = (
  model: T,
  id: string,
  options?: RemoveResourceOptions
) => Promise<RemoveResponse<T>>
