import { Model } from 'pinia-orm'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { BatchUpdateResponse, CreateResponse, DestroyResponse, FindResponse, IndexResponse, SyncResponse, UpdateResponse } from './Response'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { LoosePrimaryKey } from './LoosePrimaryKey'
import { UseIndexerOptions } from '../contracts/crud/index/UseIndexer'
import { IndexOptions } from '../contracts/crud/index/Index'
import { RemoveFunctions } from '../utils/removeFunctions'

export interface OnFindingMessage<T extends typeof Model = typeof Model> {
  entity: string
  with: IndexWiths<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface OnFoundMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: FindResponse<T>
  with: IndexWiths<InstanceType<T>>
}

export interface OnUpdatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  form: PiniaOrmForm<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface OnUpdatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: UpdateResponse<T>
}

export interface OnBatchUpdatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>
}

export interface OnBatchUpdatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: BatchUpdateResponse<T>
}

export interface OnCreatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  form: PiniaOrmForm<InstanceType<T>>
}

export interface OnCreatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: CreateResponse<T>
}

export interface OnDestroyingMessage {
  entity: string
  id: LoosePrimaryKey
}

export interface OnDestroyedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: DestroyResponse<T>
}

export interface OnIndexingMessage<T extends typeof Model = typeof Model> {
  entity: string
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>>
}

export interface OnIndexedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: IndexResponse<T>
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>> & { composableId?: string }
}

export interface OnSyncingMessage {
  entity: string
  related: string
  forms: Record<string, any>
}

export interface OnSyncedMessage<T extends typeof Model = typeof Model> {
  entity: string
  related: string
  response: SyncResponse<T>
}

export type BroadcastNameMessage = [
  ['creating', OnCreatingMessage],
  ['created', OnCreatedMessage],
  ['updating', OnUpdatingMessage],
  ['updated', OnUpdatedMessage],
  ['indexing', OnIndexingMessage],
  ['indexed', OnIndexedMessage],
  ['finding', OnFindingMessage],
  ['found', OnFoundMessage],
  ['destroying', OnDestroyingMessage],
  ['destroyed', OnDestroyedMessage],
  ['batchUpdating', OnBatchUpdatingMessage],
  ['batchUpdated', OnBatchUpdatedMessage],
  ['syncing', OnSyncingMessage],
  ['synced', OnSyncedMessage],
]

export type BroadcastMap = {
  [K in BroadcastNameMessage[number] as K[0]]: K[1]
}

export type BroadcastMessage<T extends typeof Model = typeof Model> =
  OnFindingMessage<T> |
  OnFoundMessage<T> |
  OnUpdatingMessage<T> |
  OnUpdatedMessage<T> |
  OnBatchUpdatingMessage<T> |
  OnBatchUpdatedMessage<T> |
  OnCreatingMessage<T> |
  OnCreatedMessage<T> |
  OnDestroyingMessage |
  OnDestroyedMessage<T> |
  OnIndexingMessage<T> |
  OnIndexedMessage<T> |
  OnSyncingMessage |
  OnSyncedMessage<T>
