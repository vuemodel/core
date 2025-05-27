import { Model } from 'pinia-orm'
import { UpdateResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'
import { Form } from '../../../types/Form'

export interface UpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: UpdateResponse<T>) => boolean)
}

export type Update<T extends typeof Model> = (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: Form<InstanceType<T>>,
  options?: UpdateOptions<T>
) => Promise<UpdateResponse<T>>
