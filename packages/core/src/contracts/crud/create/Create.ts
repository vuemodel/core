import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse } from '../../../types/Response'

export interface CreateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: CreateResponse<T>) => boolean)
}

export type Create<T extends typeof Model> = (
  model: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: CreateOptions<T>
) => Promise<CreateResponse<T>>
