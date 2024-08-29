import { Model, Query, Repository } from 'pinia-orm'
import { IndexFilters } from './IndexFilters'
import { OrderBy } from './IndexOrders'
import { QueryValidationErrors } from '../../errors/QueryValidationErrors'
import { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import { StandardErrors } from '../../errors/StandardErrors'
import { IndexWiths } from './IndexWiths'
import { IndexErrorResponse, IndexResponse, IndexSuccessResponse } from '../../../types/Response'
import { PaginationDetails } from './PaginationDetails'
import { IndexScopes } from './IndexScopes'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'
import { IndexOptionsParam } from '../../../types/UseIndexerParams'

export interface UseIndexerOptions<T extends typeof Model> {
  /**
   * Request filters to be applied to the data requested.
   */
  filters?: MaybeRefOrGetter<IndexFilters<InstanceType<T>>>

  /**
   * Order resources by 'ascending' or 'descending' order.
   */
  orderBy?: MaybeRefOrGetter<OrderBy<InstanceType<T>>>

  /**
   * Related data to be populated in this request.
   *
   * NOTE! If you don't wish to apply a query to the with,
   * simply provide it an empty object `with: { comments: {} }`.
   *
   * @example
   * const indexer = useIndexer(Post, {
   *   with: {
   *     comments: {}
   *   }
   * })
   *
   * @example
   * const indexer = useIndexer(Post, {
   *   with: {
   *     comments: {
   *       name: { contains: 'lugu' }
   *     }
   *   }
   * })
   */
  with?: MaybeRefOrGetter<IndexWiths<InstanceType<T>>>

  /**
   * Make the request immediately after this
   * composable is setup.
   */
  immediate?: MaybeRefOrGetter<boolean>

  /**
   * Callback called after a successful request.
   */
  onSuccess?: (response: IndexSuccessResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error).
   */
  onError?: (response: IndexErrorResponse<T>, validationErrors?: QueryValidationErrors) => void

  /**
   * Callback called when an error occurs (NOT including validation error).
   */
  onStandardError?: (response: IndexErrorResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref.
   */
  onValidationError?: (response: IndexResponse<T>) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * How the response records should be saved to the store.
   *
   * ## `save` (default)
   * Persist records **with** relationships.
   *
   * ## `insert`
   * Persist records **without** relationships.
   *
   * ## `replace-save`
   * Destroy prior records, then persist new records **with** relationships.
   *
   * ## `replace-insert`
   * Destroy prior records, then persist new records **without** relationships.
   */
  persistBy?: MaybeRefOrGetter<'save' | 'insert' | 'replace-save' | 'replace-insert'>

  /**
   * Show a notification if the request is unsuccessful.
   *
   * NOTE: For this options to work, `config.errorNotifiers`
   * needs to be set when the plugin is installed.
   */
  notifyOnError?: boolean

  /**
   * The driver used to perform the index request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsIndexer = useIndexer(Post, {
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
  pagination?: MaybeRef<Pick<PaginationDetails, 'page' | 'recordsPerPage'>>

  /**
   * Immediately paginate (make another request) when either `pagination.value.page`
   * or `pagination.value.recordsPerPage` is changed.
   */
  paginateImmediate?: MaybeRefOrGetter<boolean>

  /**
   * Scopes to be applied when indexing this resource.
   */
  scopes?: MaybeRefOrGetter<IndexScopes>

  /**
   * Perform the next request without these global scopes.
   */
  withoutGlobalScopes?: MaybeRefOrGetter<string[]>

  /**
   * Perform the next request without these entity global scopes.
   */
  withoutEntityGlobalScopes?: MaybeRefOrGetter<string[]>

  /**
   * Filter records to the given Ids. This is similar to adding an
   * `in` filter to the `primaryKey`, with the added benefit
   * of graceful handling of composite keys.
   */
  whereIdIn?: MaybeRefOrGetter<LoosePrimaryKey[] | undefined>

  /**
   * Immediately index resources when "indexer.whereIdIn" changes.
   *
   * Works by adding a watcher to `indexer.whereIdIn`.
   */
  whereIdInImmediate?: MaybeRefOrGetter<boolean>
}

export interface UseIndexerReturn<T extends typeof Model> {
  /**
   * Perform the `index` request.
   */
  index(
    options?: IndexOptionsParam<T>
  ): Promise<IndexResponse<T>>
  index(
    ids?: LoosePrimaryKey[],
    options?: IndexOptionsParam<T>
  ): Promise<IndexResponse<T>>

  /**
   * Validation errors recieved from the latest request.
   *
   * @example
   * ```html
   * <div v-for="(errorMessages, field) in validationErrors" :key="field">
   *   <strong>{{ field }}</strong>
   *   <div v-for="errorMessage in errorMessages" :key="errorMessage">
   *     {{ errorMessage }}
   *   </li>
   * </div>
   * ```
   */
  validationErrors: ComputedRef<QueryValidationErrors>

  /**
   * Standard errors recieved from the latest request.
   *
   * @example
   * ```html
   * <div
   *  v-for="standardError in standardErrors"
   *  :key="standardError.message"
   * >
   *   {{ standardError.message }}
   * </div>
   * ```
   */
  standardErrors: ComputedRef<StandardErrors>

  /**
   * `true` while requesting the data.
   */
  indexing: Ref<boolean>

  /**
   * Records retrieved from the latest request.
   *
   * Note: these records are updated when a new request is made.
   */
  records: ComputedRef<InstanceType<T>[]>

  /**
   * Response of the latest request.
   */
  response: Ref<IndexResponse<T> | undefined>

  /**
   * Make a PiniaORM query with any with, filters and orderBys passed to `options`.
   *
   * @example
   *
   * postIndexer.makeQuery()
   *  .with('user')
   *  .first()
   */
  makeQuery(): Query<InstanceType<T>>

  /**
   * For working with more than one page of data.
   */
  pagination: Ref<PaginationDetails>

  /**
   * Cancel the latest request.
   */
  cancel: () => void

  /**
   * Go to the next page.
   *
   * This works by incrementing `indexer.pagination.value.page`
   * and calling `indexer.index()`.
   */
  next: () => Promise<IndexResponse<T>>

  /**
   * Go to the previous page.
   *
   * This works by decrementing `indexer.pagination.value.page`
   * and calling `indexer.index()`.
   */
  previous: () => Promise<IndexResponse<T>>

  /**
   * Go to the given page number.
   *
   * This works by setting `indexer.pagination.value.page` to the
   * provided page number, and calling `indexer.index()`.
   */
  toPage: (pageNumber: number) => Promise<IndexResponse<T>>

  /**
   * Go to the first page.
   *
   * This works by setting `indexer.pagination.value.page`
   * to `0` and calling `indexer.index()`.
   */
  toFirstPage: () => Promise<IndexResponse<T>>

  /**
   * Go to the last page.
   *
   * This works by setting `indexer.pagination.value.page` to `indexer.pagination.value.pagesCount`,
   * and calling `indexer.index()`.
   */
  toLastPage: () => Promise<IndexResponse<T>>

  /**
   * `true` if the latest request retrieved the first page
   */
  isFirstPage: ComputedRef<boolean | undefined>

  /**
   * `true` if the latest request retrieved the last page
   */
  isLastPage: ComputedRef<boolean | undefined>

  /**
   * The PiniaORM model used to create this composable
   */
  // ModelClass: T

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>

  /**
   * Every composable gets an id. Used internally
   * when working with events.
   */
  composableId: string

  /**
   * The PiniaORM model used to create this composable
   */
  ModelClass: T,
}

export type UseIndexer<T extends typeof Model> = (
  model: T,
  options?: UseIndexerOptions<T>
) => UseIndexerReturn<T>
