import { Item, Model, Query, Repository } from 'pinia-orm'
import { QueryValidationErrors } from '../../errors/QueryValidationErrors'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { StandardErrors } from '../../errors/StandardErrors'
import { IndexWiths } from '../index/IndexWiths'
import { FindErrorResponse, FindResponse, FindSuccessResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface UseFinderOptions<T extends typeof Model> {
  /**
   * Id of the target record to find.
   */
  id?: MaybeRefOrGetter<LoosePrimaryKey>

  /**
   * Related data to be populated in the response.
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
  onSuccess?: (response: FindSuccessResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error).
   */
  onError?: (response: FindErrorResponse<T>) => void

  /**
   * Callback called when an error occurs (NOT including validation error).
   */
  onStandardError?: (response: FindErrorResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref.
   */
  onValidationError?: (response: FindResponse<T>) => void

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
   */
  persistBy?: MaybeRefOrGetter<'save' | 'insert'>

  /**
   * Show a notification if the request is unsuccessful.
   *
   * NOTE: For this options to work, `config.errorNotifiers`
   * needs to be set when the plugin is installed.
   */
  notifyOnError?: boolean

  /**
   * The driver used to perform the find request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsFinder = useFinders(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string

  withoutGlobalScopes?: MaybeRefOrGetter<string[]>
  withoutEntityGlobalScopes?: MaybeRefOrGetter<string[]>
}

export interface UseFinderReturn<T extends typeof Model> {
  /**
   * Perform the `find` request.
   */
  find: (id?: LoosePrimaryKey) => Promise<FindResponse<T>>

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
   * id of the resource currently being found.
   */
  finding: Ref<LoosePrimaryKey | false>

  /**
   * Record retrieved from the latest request. This record comes from the
   * store (`useRepo.find('some-id')`) and therefore, it is an instance
   * of the model passed to `useCreator(SomeModel)`.
   *
   * Note: this record is updated when a new request is made.
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request.
   */
  response: Ref<FindResponse<T> | undefined>

  /**
   * Cancel the latest request.
   */
  cancel: () => void

  /**
   * Make a PiniaORM query using the id of the last fetched
   * record, and any with passed to `options.with`.
   *
   * By default, the `id` parameter will be discovered for you based on
   * the latest request.
   *
   * NOTE: Under the hood the query is made with `query.whereId('some-id')` **NOT** `query.find('some-id')`.
   * We do this so that the query is chainable. This means to execute the query, we use
   * `.first()` as opposed to `.find('some-id')` (see example below).
   *
   * @example
   *
   * postFinder.makeQuery()
   *  .with('user')
   *  .first()
   */
  makeQuery(idParam?: LoosePrimaryKey): Query<InstanceType<T>>

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

export type UseFinder<T extends typeof Model> = (
  model: T,
  options?: UseFinderOptions<T>
) => UseFinderReturn<T>
