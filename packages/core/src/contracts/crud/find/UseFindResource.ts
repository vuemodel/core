import { Item, Model, Query } from 'pinia-orm'
import { QueryValidationErrors } from '../../errors/QueryValidationErrors'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { StandardErrors } from '../../errors/StandardErrors'
import { IndexResourcesIncludes } from '../index/IndexResourcesIncludes'
import { FindResponse } from '../../../types/ResourceResponse'

export interface UseFindResourceOptions<T extends typeof Model> {
  /**
   * The id to use by default. If an id is provided to 'find'
   * (e.g. `find(1)`) then this id
   * will take precedence.
   */
  id?: MaybeRefOrGetter<string | number>

  /**
   * Related data to be included in the response
   */
  includes?: MaybeRefOrGetter<IndexResourcesIncludes<T>>

  /**
   * Make the request immediately after this
   * composable is setup
   */
  immediate?: MaybeRefOrGetter<boolean>

  /**
   * Callback called after a successful request
   */
  onSuccess?: (response: FindResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error)
   */
  onError?: (response: FindResponse<T>, validationErrors?: QueryValidationErrors) => void

  /**
   * Callback called when an error occurs (NOT including validation error)
   */
  onStandardError?: (response: FindResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref
   */
  onValidationError?: (response: FindResponse<T>) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

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
   * const strapiPostsFinder = useFindResources(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string
}

export interface UseFindResourceReturn<T extends typeof Model> {
  /**
   * Perform the `find` request
   */
  find: (id?: string | number) => Promise<void>

  /**
   * Validation errors recieved from the latest request
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
   * Standard errors recieved from the latest request
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
   * `true` while finding the data
   */
  finding: Ref<string | number | undefined>

  /**
   * Record retrieved from the latest request. This record comes from the
   * store (`useRepo.find('some-id')`) and therefore, it is an instance
   * of the model passed to `useCreateResource(SomeModel)`.
   *
   * Note: this record is updated when a new request is made
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request
   */
  response: Ref<FindResponse<T> | undefined>

  /**
   * All active requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeRequests: Ref<Record<string | number, {
    request: Promise<FindResponse<T>>
  }>>

  /**
   * Make a PiniaORM query using the id of the last fetched
   * record, and any includes passed to `options.includes`
   *
   * By default, the `id` paramater will be discovered for you based on
   * the latest request.
   *
   * NOTE: Under the hood the query is made with `query.whereId('some-id')` **NOT** `query.find('some-id')`.
   * We do this so that the query is chainable. This means to execute the query, we use
   * `.first()` as opposed to `.find('some-id')` (see example below)
   *
   * @example
   *
   * postFinder.makeQuery()
   *  .with('user')
   *  .first()
   */
  makeQuery(idParam?: string | number): Query<InstanceType<T>>
}

export type UseFindResource<T extends typeof Model> = (
  model: T,
  options?: UseFindResourceOptions<T>
) => UseFindResourceReturn<T>
