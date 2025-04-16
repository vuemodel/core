import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { PaginationDetails } from '../contracts/crud/index/PaginationDetails'
import { UseBulkUpdateFormValidationErrors } from '../contracts/bulk-update/UseBulkUpdater'

export type BaseSuccessResponse = {
  standardErrors: undefined
  success: true
  entity: string
}

export type BaseErrorResponse = {
  standardErrors: StandardErrors
  success: false
  entity: string
}

export type QueryValidationSuccessResponse = BaseSuccessResponse & {
  validationErrors: undefined
}

export type QueryValidationErrorResponse = BaseErrorResponse & {
  validationErrors: QueryValidationErrors
}

export type FormValidationSuccessResponse = BaseSuccessResponse & {
  validationErrors: undefined
}

export type FormValidationErrorResponse<T extends typeof Model> = BaseErrorResponse & {
  validationErrors: FormValidationErrors<InstanceType<T>>
}

export type BulkFormValidationSuccessResponse = BaseSuccessResponse & {
  validationErrors: undefined
}

export type BulkFormValidationErrorResponse<T extends typeof Model> = BaseErrorResponse & {
  validationErrors: UseBulkUpdateFormValidationErrors<InstanceType<T>>
}

export type SingleRecordResponse<T extends typeof Model> = {
  record: DeclassifyPiniaOrmModel<InstanceType<T>> | undefined
}

export type MultipleRecordsResponse<T extends typeof Model> = {
  records: DeclassifyPiniaOrmModel<InstanceType<T>>[] | undefined
}

export type PaginationResponse = {
  pagination?: PaginationDetails
}

export type CreateValidationErrorResponse<T extends typeof Model> = { action: 'create' } & (FormValidationErrorResponse<T>) & SingleRecordResponse<T>

export type CreateSuccessResponse<T extends typeof Model> = { action: 'create' } & FormValidationSuccessResponse & SingleRecordResponse<T>
export type CreateErrorResponse<T extends typeof Model> = { action: 'create' } & FormValidationErrorResponse<T> & SingleRecordResponse<T>
export type CreateResponse<T extends typeof Model> = CreateSuccessResponse<T> | CreateErrorResponse<T>

export type FindSuccessResponse<T extends typeof Model> = { action: 'find' } & QueryValidationSuccessResponse & SingleRecordResponse<T>
export type FindErrorResponse<T extends typeof Model> = { action: 'find' } & QueryValidationErrorResponse & SingleRecordResponse<T>
export type FindResponse<T extends typeof Model> = FindSuccessResponse<T> | FindErrorResponse<T>

export type UpdateSuccessResponse<T extends typeof Model> = { action: 'update' } & FormValidationSuccessResponse & SingleRecordResponse<T>
export type UpdateErrorResponse<T extends typeof Model> = { action: 'update' } & FormValidationErrorResponse<T> & SingleRecordResponse<T>
export type UpdateResponse<T extends typeof Model> = UpdateSuccessResponse<T> | UpdateErrorResponse<T>

export type DestroySuccessResponse<T extends typeof Model> = { action: 'destroy' } & BaseSuccessResponse & SingleRecordResponse<T>
export type DestroyErrorResponse<T extends typeof Model> = { action: 'destroy' } & BaseErrorResponse & SingleRecordResponse<T>
export type DestroyResponse<T extends typeof Model> = DestroySuccessResponse<T> | DestroyErrorResponse<T>

export type IndexSuccessResponse<T extends typeof Model> = { action: 'index' } & QueryValidationSuccessResponse & MultipleRecordsResponse<T> & PaginationResponse
export type IndexErrorResponse<T extends typeof Model> = { action: 'index' } & QueryValidationErrorResponse & MultipleRecordsResponse<T>
export type IndexResponse<T extends typeof Model> = IndexSuccessResponse<T> | IndexErrorResponse<T>

export type BulkUpdateSuccessResponse<T extends typeof Model> = { action: 'bulk-update' } & BulkFormValidationSuccessResponse & MultipleRecordsResponse<T>
export type BulkUpdateErrorResponse<T extends typeof Model> = { action: 'bulk-update' } & BulkFormValidationErrorResponse<T> & MultipleRecordsResponse<T>
export type BulkUpdateResponse<T extends typeof Model> = BulkUpdateSuccessResponse<T> | BulkUpdateErrorResponse<T>

export type SyncSuccessResponse = {
  action: 'sync'
  attached: Record<string, any>[]
  detached: Record<string, any>[]
  updated: Record<string, any>[]
} & BaseSuccessResponse
export type SyncErrorResponse<T extends typeof Model> = BulkFormValidationErrorResponse<T> & {
  action: 'sync'
  attached: undefined
  detached: undefined
  updated: undefined
}
export type SyncResponse<T extends typeof Model> = SyncSuccessResponse | SyncErrorResponse<T>

export type Response<T extends typeof Model> =
  CreateResponse<T> |
  FindResponse<T> |
  UpdateResponse<T> |
  DestroyResponse<T> |
  IndexResponse<T> |
  BulkUpdateResponse<T> |
  SyncResponse<T>
