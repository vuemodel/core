import { Model } from 'pinia-orm'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { BulkUpdateSuccessResponse, CreateSuccessResponse, DestroySuccessResponse, FindSuccessResponse, IndexSuccessResponse, SyncSuccessResponse, UpdateSuccessResponse } from '../types/Response'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'
import { UseIndexerOptions } from '../contracts/crud/index/UseIndexer'
import { IndexOptions } from '../contracts/crud/index/Index'
import { RemoveFunctions } from '../utils/removeFunctions'

type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;
type IsAny<T> = IfAny<T, true, false>;

type ResolveModelClass<T> = IsAny<T> extends true ? any : T;

export interface FindingHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: ResolveModelClass<T>
  entity: string
  with: IndexWiths<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface FoundHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: FindSuccessResponse<T>
  with: IndexWiths<InstanceType<T>>
}

export interface FindPersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: FindSuccessResponse<T>
  with: IndexWiths<InstanceType<T>>
}

export interface UpdatingHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  form: [T] extends [typeof Model] ? Record<string, any> : PiniaOrmForm<InstanceType<T>>
  id: LoosePrimaryKey
}

export interface UpdatedHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: UpdateSuccessResponse<T>
}

export type UpdatePersistHookPayload<T extends typeof Model = typeof Model> = {
  ModelClass: T
  entity: string
  response: UpdateSuccessResponse<T>
}

export type UpdateOptimisticPersistHookPayload<T extends typeof Model = typeof Model> = {
  ModelClass: T
  entity: string
  form: [T] extends [typeof Model] ? Record<string, any> : PiniaOrmForm<InstanceType<T>>
}

export interface BulkUpdatingHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  forms: Record<string | number, [T] extends [typeof Model] ? Record<string, any> : PiniaOrmForm<InstanceType<T>>>
}

export interface BulkUpdatedHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: BulkUpdateSuccessResponse<T>
}

export interface BulkUpdatePersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: BulkUpdateSuccessResponse<T>
}

export interface CreatingHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  form: [T] extends [typeof Model] ? Record<string, any> : PiniaOrmForm<InstanceType<T>>
}

export interface CreatedHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: CreateSuccessResponse<T>
}

export interface CreateOptimisticPersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  form: [T] extends [typeof Model] ? Record<string, any> : PiniaOrmForm<InstanceType<T>>
}

export interface CreatePersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: CreateSuccessResponse<T>
}

export interface DestroyingHookPayload {
  ModelClass: typeof Model
  entity: string
  id: LoosePrimaryKey
}

export interface DestroyedHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: DestroySuccessResponse<T>
}

export interface DestroyPersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: DestroySuccessResponse<T>
}

export interface DestroyOptimisticPersistHookPayload {
  ModelClass: typeof Model
  entity: string
  id: string | number
}

export interface IndexingHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>>
}

export interface IndexedHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: IndexSuccessResponse<T>
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>> & { composableId?: string }
}

export interface IndexPersistHookPayload<T extends typeof Model = typeof Model> {
  ModelClass: T
  entity: string
  response: IndexSuccessResponse<T>
  with: IndexOptions<T>['with']
  filters: IndexOptions<T>['filters']
  orderBy: IndexOptions<T>['orderBy']
  pagination: IndexOptions<T>['pagination']
  _useIndexerOptions: RemoveFunctions<UseIndexerOptions<T>> & { composableId?: string }
}

export interface SyncingHookPayload {
  ModelClass: typeof Model
  entity: string
  related: string
  forms: Record<string, any>
}

export interface SyncedHookPayload {
  ModelClass: typeof Model
  entity: string
  related: string
  response: SyncSuccessResponse
}

export interface SyncPersistHookPayload {
  ModelClass: typeof Model
  entity: string
  related: string
  response: SyncSuccessResponse
}

export type HookNamePayload = [
  ['creating', CreatingHookPayload],
  ['created', CreatedHookPayload],
  ['createPersist', CreatePersistHookPayload],
  ['createOptimisticPersist', CreateOptimisticPersistHookPayload],

  ['updating', UpdatingHookPayload],
  ['updated', UpdatedHookPayload],
  ['updatePersist', UpdatePersistHookPayload],
  ['updateOptimisticPersist', UpdateOptimisticPersistHookPayload],

  ['indexing', IndexingHookPayload],
  ['indexed', IndexedHookPayload],
  ['indexPersist', IndexPersistHookPayload],

  ['finding', FindingHookPayload],
  ['found', FoundHookPayload],
  ['findPersist', FindPersistHookPayload],

  ['destroying', DestroyingHookPayload],
  ['destroyed', DestroyedHookPayload],
  ['destroyPersist', DestroyPersistHookPayload],
  ['destroyOptimisticPersist', DestroyOptimisticPersistHookPayload],

  ['bulkUpdating', BulkUpdatingHookPayload],
  ['bulkUpdated', BulkUpdatedHookPayload],
  ['bulkUpdatePersist', BulkUpdatePersistHookPayload],

  ['syncing', SyncingHookPayload],
  ['synced', SyncedHookPayload],
  ['syncPersist', SyncPersistHookPayload],
]

export type HookMap = {
  [K in HookNamePayload[number] as K[0]]: K[1]
}
