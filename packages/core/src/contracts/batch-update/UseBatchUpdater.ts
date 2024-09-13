import { Collection, Model, Repository } from 'pinia-orm'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { FilterPiniaOrmModelToFieldTypes, FilterPiniaOrmModelToRelationshipTypes, PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateErrorResponse, BatchUpdateResponse, BatchUpdateSuccessResponse, SyncResponse } from '../../types/Response'
import { FormValidationErrors } from '../errors/FormValidationErrors'
import { StandardErrors } from '../errors/StandardErrors'
import { UseIndexerOptions, UseIndexerReturn } from '../crud/index/UseIndexer'
import { PiniaOrmManyRelationsForm } from '../../types/PiniaOrmManyRelationsForm'
import { Form } from '../..'

type UnwrapType<T> =
  T extends Array<infer U> ? U :
  T extends (infer U) | null ? U :
  never;

export type BatchUpdateForm<T extends Model> = PiniaOrmForm<T> & PiniaOrmManyRelationsForm<T>

export type UseBatchUpdateFormValidationErrors<T extends typeof Model> = Record<
  string,
  FormValidationErrors<T> &
  {
    [RelationKey in keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>]: Record<string, {
      [K in keyof Form<T[RelationKey]>]: string[]
    } & {
      [key: string]: string[]
    }>
  }
>

export interface BatchUpdateMeta<T extends Model> {
  changed: boolean
  initialValues: BatchUpdateForm<T>
  makingForm: boolean
  updating: boolean
  fields: {
    [K in keyof FilterPiniaOrmModelToFieldTypes<T>]: {
      changed: boolean
      updating: boolean
      initialValue: UnwrapType<T[K]>
    }
  }
}

export type FormWithMeta<T extends Model> = {
  id: string
  form: BatchUpdateForm<T>
} & BatchUpdateMeta<T>

export interface UseBatchUpdateUpdateOptions<T extends typeof Model> {
  forms?: Record<string, BatchUpdateForm<InstanceType<T>>>
}

export interface UseBatchUpdaterOptions<
  T extends typeof Model,
> {
  /**
   * Here you may prefill the update forms. Use an object
   * where the key is the "id" of the resource, and
   * value is the resources form.
   *
   * It's likely this field is **not required** as the
   * composable can make the forms for us
   * with `makeForms()`
   */
  forms?: Record<string, BatchUpdateForm<InstanceType<T>>>

  /**
   * Make forms with all the records that currently
   * exist in the store
   */
  immediatelyMakeForms?: MaybeRefOrGetter<boolean>

  syncOn?: MaybeRefOrGetter<{
    indexed?: boolean
    created?: boolean
    found?: boolean
    updated?: boolean
    destroyed?: boolean
  }>

  /**
   * `useBatchUpdater` uses `useIndexer` behind the scenes
   * When finding records. Here, you can pass options
   * to this indexer
   */
  indexer?: UseIndexerOptions<T>

  /**
   * Fields that should not be included when making the form
   */
  excludeFields?: string[],

  /**
   * Update forms when they change.
   */
  autoUpdate?: MaybeRefOrGetter<boolean>

  /**
   * Only relevant `autoUpdate` is true. Debounces
   * auto update of forms.
   */
  autoUpdateDebounce?: MaybeRefOrGetter<number>

  /**
   * Callback called after a successful request
   */
  onSuccess?: (response: BatchUpdateSuccessResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation errors)
   */
  onError?: (response: BatchUpdateErrorResponse<T>) => void

  /**
   * Callback called when an error occurs (NOT including validation error)
   */
  onStandardError?: (response: BatchUpdateErrorResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the `validationErrors` computed ref
   */
  onValidationError?: (response: BatchUpdateErrorResponse<T>) => void

  /**
   * Should the updated records be persisted to the store?
   *
   * This does **NOT** apply to the indexer used behind
   * the scenes when making forms. Only updated
   * records after a `batchUpdater.update()`.
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * Show a notification if the request is unsuccessful.
   *
   * NOTE: For this options to work, `config.errorNotifiers`
   * needs to be set when the plugin is installed.
   */
  notifyOnError?: MaybeRefOrGetter<boolean>

  /**
   * The driver used to perform the update request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsUpdater = useUpdaters(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string

  /**
   * For working with more than one page of data.
   *
   * @example
   *
   * {
   *   page: 1,
   *   recordsPerPage: 3
   * }
   */
  pagination?: UseIndexerOptions<T>['pagination']
}

export interface UseBatchUpdaterReturn<
  T extends typeof Model,
  RelationshipTypes = FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>,
  Request = Promise<BatchUpdateResponse<T>> & { cancel(): void },
  SyncRequests = Record<
    keyof RelationshipTypes,
    (Promise<SyncResponse<T>> & { cancel(): void })
  >
> {
  update(options?: UseBatchUpdateUpdateOptions<T>): Promise<BatchUpdateResponse<T>>

  forms: Ref<Record<string, BatchUpdateForm<InstanceType<T>>>>

  /**
   * All changes since the last batch update
   */
  changes: Ref<Record<string, BatchUpdateForm<InstanceType<T>>>>

  /**
   * Make a form for every record in the store
   *
   * ---
   *
   * If `targetIds` is provided:
   * - Only make forms with provided `targetIds`
   * - Make an `index()` request to find all `targetIds` that aren't already in the store
   */
  makeForms: (
    targetIds?: string[]
  ) => Promise<Record<string, BatchUpdateForm<InstanceType<T>>>>

  /**
   * Remove form with the given id.
   *
   * It's unlikely you'll need this function. By default
   * VueModel add/removes forms for you behind the scenes
   */
  removeForm: (recordId: string) => void

  /**
   * All records from the latest update
   */
  updatedRecords: ComputedRef<Collection<InstanceType<T>>>

  /**
   * `true` if **any** forms are updating
   */
  updating: Ref<boolean>

  /**
   * Validation errors, keyed by the records id
   */
  validationErrors: ComputedRef<UseBatchUpdateFormValidationErrors<T>>

  /**
   * All non-validation errors
   */
  standardErrors: ComputedRef<StandardErrors>

  /**
   * Meta information for all forms and their fields, keyed by id
   */
  meta: Ref<Record<string, BatchUpdateMeta<InstanceType<T>>>>

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>

  /**
   * All active requests
   */
  activeRequests: Ref<Record<string | number, {
    request: Request
    forms: Record<string, BatchUpdateForm<InstanceType<T>>>
  }>>

  /**
   * Latest active request
   */
  activeRequest: Ref<{
    request: Request
    forms: Record<string, BatchUpdateForm<InstanceType<T>>>
  } | undefined>

  /**
   * Response of the latest batch update
   */
  response: Ref<BatchUpdateResponse<T> | undefined>

  /**
   * All active belongsToMany (sync) requests
   */
  activeBelongsToManyRequests: Ref<SyncRequests>

  /**
   * Latest belongsToMany (sync) responses
   */
  belongsToManyResponses: Ref<
    Record<keyof RelationshipTypes, SyncResponse<T>> |
    undefined
  >

  /**
   * An array of the current pages forms. Use `formsWithMeta`
   * to easily model your forms on the frontend, while
   * having access to everything you need to
   * communicate the state of the form
   */
  formsWithMeta: ComputedRef<FormWithMeta<InstanceType<T>>[]>

  /**
   * Every composable gets an id. Used internally
   * when working with events.
   */
  composableId: string

  /**
   * The PiniaORM model used to create this composable
   */
  ModelClass: T,

  /**
   * `true` if the latest request retrieved the last page
   */
  index: UseIndexerReturn<T>['index']

  /**
   * `true` while indexing data.
   *
   * This is often done before making forms.
   */
  indexing: UseIndexerReturn<T>['indexing']

  /**
   * Records retrieved from the latest index request.
   */
  records: UseIndexerReturn<T>['records']

  /**
   * For working with more than one page of data.
   */
  pagination: UseIndexerReturn<T>['pagination']

  /**
   * Go to the next page.
   *
   * This works by incrementing `indexer.pagination.value.page`
   * and calling `indexer.index()`.
   */
  next: UseIndexerReturn<T>['next']

  /**
   * Go to the previous page.
   *
   * This works by decrementing `indexer.pagination.value.page`
   * and calling `indexer.index()`.
   */
  previous: UseIndexerReturn<T>['previous']

  /**
   * Go to the given page number.
   *
   * This works by setting `indexer.pagination.value.page` to the
   * provided page number, and calling `indexer.index()`.
   */
  toPage: UseIndexerReturn<T>['toPage']

  /**
   * Go to the first page.
   *
   * This works by setting `indexer.pagination.value.page`
   * to `0` and calling `indexer.index()`.
   */
  toFirstPage: UseIndexerReturn<T>['toFirstPage']

  /**
   * Go to the last page.
   *
   * This works by setting `indexer.pagination.value.page` to `indexer.pagination.value.pagesCount`,
   * and calling `indexer.index()`.
   */
  toLastPage: UseIndexerReturn<T>['toLastPage']

  /**
   * `true` if the latest request retrieved the first page
   */
  isFirstPage: UseIndexerReturn<T>['isFirstPage']

  /**
   * `true` if the latest request retrieved the last page
   */
  isLastPage: UseIndexerReturn<T>['isLastPage']

  /**
   * `true` if the latest request retrieved the last page
   */
  indexer: UseIndexerReturn<T>
}

export type UseBatchUpdater<T extends typeof Model> = (
  model: T,
  options?: UseBatchUpdaterOptions<T>
) => UseBatchUpdaterReturn<T>
