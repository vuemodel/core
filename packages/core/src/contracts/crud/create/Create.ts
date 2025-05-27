import { Model } from 'pinia-orm'
import { CreateResponse } from '../../../types/Response'
import { Form } from '../../../types/Form'

export interface CreateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: CreateResponse<T>) => boolean)
}

export type Create<T extends typeof Model> = (
  ModelClass: T,
  form: Form<InstanceType<T>>,
  options?: CreateOptions<T>
) => Promise<CreateResponse<T>>
