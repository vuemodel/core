import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../../../types/ResourceResponse'

export interface UpdateResourceOptions {
  driver?: string
  notifyOnError?: boolean
}

export type UpdateResource<T extends typeof Model> = (
  model: T,
  id: string,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: UpdateResourceOptions
) => Promise<UpdateResponse<T>>
