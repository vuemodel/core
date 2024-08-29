import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { UpdateResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface UpdateOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: UpdateResponse<T>) => boolean)
}

export type Update<T extends typeof Model> = (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: PiniaOrmForm<InstanceType<T>>,
  options?: UpdateOptions<T>
) => Promise<UpdateResponse<T>>
