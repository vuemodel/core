import { Model } from 'pinia-orm'
import { SyncErrorResponse, SyncResponse } from '../../types/Response'
import { FilterPiniaOrmModelToManyRelationshipTypes } from '../../types/FilterPiniaOrmModelToManyRelationshipTypes'
import { LoosePrimaryKey } from '../../types/LoosePrimaryKey'

export interface SyncOptions<T extends typeof Model> {
  driver?: string
  notifyOnError?: boolean
  signal?: AbortController['signal']
  throw?: boolean | ((response?: SyncErrorResponse<T>) => boolean)
}

export type Sync<T extends typeof Model> = (
  ModelClass: T,
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, any>,
  options?: SyncOptions<T>
) => Promise<SyncResponse<T>>
