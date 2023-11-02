import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../../../types/ResourceResponse'

export interface CreateResourceOptions {
  driver?: string
  notifyOnError?: boolean
}

export type CreateResource<T extends typeof Model> = (
  model: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: CreateResourceOptions
) => Promise<CreateResponse<T>>
