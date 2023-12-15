import { Item, Model, Repository } from 'pinia-orm'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { StandardErrors } from '../../errors/StandardErrors'
import { DestroyErrorResponse, DestroyResponse, DestroySuccessResponse } from '../../../types/Response'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface UseDestroyerOptions<T extends typeof Model> {
  /**
   * Id of the target record to destroy.
   */
  id?: MaybeRefOrGetter<LoosePrimaryKey>

  /**
   * Callback called after a successful request.
   */
  onSuccess?: (response: DestroySuccessResponse<T>) => void

  /**
   * Callback called when a standard error occurs.
   */
  onStandardError?: (response: DestroyErrorResponse<T>) => void

  /**
   * Callback called when an error occurs.
   */
  onError?: (response: DestroyErrorResponse<T>) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * When optimistic is `true`, the record is destroyed from
   * the store **before** it's destroyed from the backend.
   *
   * If after destroying the record the request fails, the record
   * is added back to the store.
   */
  optimistic?: MaybeRefOrGetter<boolean>

  /**
   * Show a notification if the request is unsuccessful.
   *
   * NOTE: For this options to work, `config.errorNotifiers`
   * needs to be set when the plugin is installed.
   */
  notifyOnError?: boolean

  /**
   * The driver used to perform the destroy request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsDestroyer = useDestroyers(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string
}

export interface UseDestroyerReturn<T extends typeof Model> {
  /**
   * Perform the `destroy` request.
   */
  destroy: (id?: LoosePrimaryKey) => Promise<DestroyResponse<T>>

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
   * `true` while destroying the data.
   */
  destroying: Ref<LoosePrimaryKey | false>

  /**
   * Record retrieved from the latest request.
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request.
   */
  response: Ref<DestroyResponse<T> | undefined>

  /**
   * All active requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeRequests: Ref<Record<string | number, {
    request: Promise<DestroyResponse<T>> & { cancel(): void }
  }>>

  /**
   * Cancel the latest request.
   */
  cancel: () => void

  /**
   * The PiniaORM model used to create this composable
   */
  // ModelClass: T

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>
}

export type UseDestroyer<T extends typeof Model> = (
  model: T,
  options?: UseDestroyerOptions<T>
) => UseDestroyerReturn<T>
