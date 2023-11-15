import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { PaginationDetails } from '../contracts/crud/index/PaginationDetails'

export type BaseSuccessResponse = {
  standardErrors: undefined
  success: true
}

export type BaseErrorResponse = {
  standardErrors: StandardErrors
  success: false
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
  validationErrors: FormValidationErrors<T>
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

export type CreateValidationErrorResponse<T extends typeof Model> = { action: 'create' } & (FormValidationErrorResponse<T>) & { record: undefined }

export type CreateResponse<T extends typeof Model> = { action: 'create' } & (FormValidationSuccessResponse | FormValidationErrorResponse<T>) & SingleRecordResponse<T>
export type FindResponse<T extends typeof Model> = { action: 'find' } & (QueryValidationSuccessResponse | QueryValidationErrorResponse) & SingleRecordResponse<T>
export type UpdateResponse<T extends typeof Model> = { action: 'update' } & (FormValidationSuccessResponse | FormValidationErrorResponse<T>) & SingleRecordResponse<T>
export type RemoveResponse<T extends typeof Model> = { action: 'remove' } & (BaseSuccessResponse | BaseErrorResponse) & SingleRecordResponse<T>
export type IndexResponse<T extends typeof Model> = { action: 'index' } & (QueryValidationSuccessResponse | QueryValidationErrorResponse) & MultipleRecordsResponse<T> & PaginationResponse

export type ResourceResponse<T extends typeof Model> = CreateResponse<T> | FindResponse<T> | UpdateResponse<T> | RemoveResponse<T> | IndexResponse<T>
