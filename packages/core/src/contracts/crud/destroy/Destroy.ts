import { Model } from 'pinia-orm'
import { DestroyResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface DestroyOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: DestroyResponse<T>) => boolean)
}

export type Destroy<T extends typeof Model> = (
  model: T,
  id: LoosePrimaryKey,
  options?: DestroyOptions<T>
) => Promise<DestroyResponse<T>>
