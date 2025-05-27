import { Model } from 'pinia-orm'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { BulkUpdateSuccessResponse, CreateSuccessResponse, DestroySuccessResponse, FindSuccessResponse, IndexSuccessResponse, SyncSuccessResponse, UpdateSuccessResponse } from '../types/Response'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { UseIndexerOptions } from '../contracts/crud/index/UseIndexer'
import { IndexOptions } from '../contracts/crud/index/Index'
import { RemoveFunctions } from '../utils/removeFunctions'
import { Form } from '../types/Form'

export interface OnFindingMessage<T extends typeof Model = typeof Model> {
  entity: string
  with: IndexWiths<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface OnFoundMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: FindSuccessResponse<T>
  with: IndexWiths<InstanceType<T>>
}

export interface OnFindPersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: FindSuccessResponse<T>
  with: IndexWiths<InstanceType<T>>
}

export interface OnUpdatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  form: Form<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface OnUpdatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: UpdateSuccessResponse<T>
}

export type OnUpdatePersistMessage<T extends typeof Model = typeof Model> = {
  entity: string
  response: UpdateSuccessResponse<T>
}

export type OnUpdateOptimisticPersistMessage<T extends typeof Model = typeof Model> = {
  entity: string
  form: Form<InstanceType<T>>
}

export interface OnBulkUpdatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  forms: Record<string | number, Form<InstanceType<T>>>
}

export interface OnBulkUpdatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: BulkUpdateSuccessResponse<T>
}

export interface OnBulkUpdatePersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: BulkUpdateSuccessResponse<T>
}

export interface OnCreatingMessage<T extends typeof Model = typeof Model> {
  entity: string
  form: Form<InstanceType<T>>
}

export interface OnCreatedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: CreateSuccessResponse<T>
}

export interface OnCreateOptimisticPersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  form: Form<InstanceType<T>>
}

export interface OnCreatePersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: CreateSuccessResponse<T>
}

export interface OnDestroyingMessage {
  entity: string
  id: LoosePrimaryKey
}

export interface OnDestroyedMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: DestroySuccessResponse<T>
}

export interface OnDestroyPersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: DestroySuccessResponse<T>
}

export interface OnDestroyOptimisticPersistMessage {
  entity: string
  id: string | number
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
  response: IndexSuccessResponse<T>
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>> & { composableId?: string }
}

export interface OnIndexPersistMessage<T extends typeof Model = typeof Model> {
  entity: string
  response: IndexSuccessResponse<T>
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

export interface OnSyncedMessage {
  entity: string
  related: string
  response: SyncSuccessResponse
}

export interface OnSyncPersistMessage {
  entity: string
  related: string
  response: SyncSuccessResponse
}

export type BroadcastNameMessage = [
  ['creating', OnCreatingMessage],
  ['created', OnCreatedMessage],
  ['createPersist', OnCreatePersistMessage],
  ['createOptimisticPersist', OnCreateOptimisticPersistMessage],

  ['updating', OnUpdatingMessage],
  ['updated', OnUpdatedMessage],
  ['updatePersist', OnUpdatePersistMessage],
  ['updateOptimisticPersist', OnUpdateOptimisticPersistMessage],

  ['indexing', OnIndexingMessage],
  ['indexed', OnIndexedMessage],
  ['indexPersist', OnIndexPersistMessage],

  ['finding', OnFindingMessage],
  ['found', OnFoundMessage],
  ['findPersist', OnFindPersistMessage],

  ['destroying', OnDestroyingMessage],
  ['destroyed', OnDestroyedMessage],
  ['destroyPersist', OnDestroyPersistMessage],
  ['destroyOptimisticPersist', OnDestroyOptimisticPersistMessage],

  ['bulkUpdating', OnBulkUpdatingMessage],
  ['bulkUpdated', OnBulkUpdatedMessage],
  ['bulkUpdatePersist', OnBulkUpdatePersistMessage],

  ['syncing', OnSyncingMessage],
  ['synced', OnSyncedMessage],
  ['syncPersist', OnSyncPersistMessage],
]

export type BroadcastMap = {
  [K in BroadcastNameMessage[number] as K[0]]: K[1]
}

export type BroadcastMessage<T extends typeof Model = typeof Model> =
  OnFindingMessage<T> |
  OnFoundMessage<T> |
  OnFindPersistMessage<T> |
  OnUpdatingMessage<T> |
  OnUpdatedMessage<T> |
  OnUpdatePersistMessage<T> |
  OnUpdateOptimisticPersistMessage<T> |
  OnBulkUpdatingMessage<T> |
  OnBulkUpdatedMessage<T> |
  OnBulkUpdatePersistMessage<T> |
  OnCreatingMessage<T> |
  OnCreatedMessage<T> |
  OnCreatePersistMessage<T> |
  OnDestroyingMessage |
  OnDestroyedMessage<T> |
  OnDestroyPersistMessage<T> |
  OnIndexingMessage<T> |
  OnIndexedMessage<T> |
  OnIndexPersistMessage<T> |
  OnSyncingMessage |
  OnSyncPersistMessage |
  OnSyncedMessage
