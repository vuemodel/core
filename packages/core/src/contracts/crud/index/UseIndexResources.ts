import { Model, Query } from 'pinia-orm'
import { IndexResourcesFilters } from './IndexResourcesFilters'
import { SortBy } from './IndexResourcesSorts'
import { QueryValidationErrors } from '../../errors/QueryValidationErrors'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { StandardErrors } from '../../errors/StandardErrors'
import { IndexResourcesIncludes } from './IndexResourcesIncludes'
import { IndexResponse } from 'src/types/ResourceResponse'

export interface UseIndexResourcesOptions<T extends typeof Model> {
  /**
   * Request filters to be applied to the data requested
   */
  filters?: MaybeRefOrGetter<IndexResourcesFilters<T>>

  /**
   * Sort resources by 'ascending' or 'descending' order
   */
  sortBy?: MaybeRefOrGetter<SortBy<T>>

  /**
   * Request a specific limit of resources to return
   */
  limit?: MaybeRefOrGetter<number>

  /**
   * Related data to be included in this request
   *
   * NOTE! If you don't wish to apply a query to the includes,
   * simply provide it an empty object `includes: { comments: {} }`.
   *
   * @example
   * const indexer = useIndexResources(Post, {
   *   includes: {
   *     comments: {}
   *   }
   * })
   *
   * @example
   * const indexer = useIndexResources(Post, {
   *   includes: {
   *     comments: {
   *       name: { contains: 'lugu' }
   *     }
   *   }
   * })
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
  onSuccess?: (response: IndexResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error)
   */
  onError?: (response: IndexResponse<T>, validationErrors?: QueryValidationErrors) => void

  /**
   * Callback called when an error occurs (NOT including validation error)
   */
  onStandardError?: (response: IndexResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref
   */
  onValidationError?: (response: IndexResponse<T>) => void

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
   * The driver used to perform the index request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsIndexer = useIndexResources(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string
}

export interface UseIndexResourcesReturn<T extends typeof Model> {
  /**
   * Perform the `index` request
   */
  index: () => Promise<void>

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
   * `true` while requesting the data
   */
  indexing: Ref<boolean>

  /**
   * Records retrieved from the latest request
   *
   * Note: these records are updated when a new request is made
   */
  records: ComputedRef<DeclassifyPiniaOrmModel<InstanceType<T>>[]>

  /**
   * Response of the latest request
   */
  response: Ref<IndexResponse<T> | undefined>

  /**
   * Make a PiniaORM query with any includes, filters and orderBys passed to `options`
   *
   * @example
   *
   * postIndexer.makeQuery()
   *  .with('user')
   *  .first()
   */
  makeQuery(): Query<InstanceType<T>>
}

export type UseIndexResources<T extends typeof Model> = (
  model: T,
  options?: UseIndexResourcesOptions<T>
) => UseIndexResourcesReturn<T>
