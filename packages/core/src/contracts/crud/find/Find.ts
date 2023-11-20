import { Model } from 'pinia-orm'
import { IndexWiths } from '../index/IndexWiths'
import { FindResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface FindOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  with?: IndexWiths<InstanceType<T>>
  signal?: AbortController['signal']
  throw?: boolean | ((response?: FindResponse<T>) => boolean)
}

export type Find<T extends typeof Model> = (
  ModelClass: T,
  id: LoosePrimaryKey,
  options?: FindOptions<T>
) => Promise<FindResponse<T>>
