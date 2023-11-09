import { Item, Model } from 'pinia-orm'
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { StandardErrors } from '../../errors/StandardErrors'
import { RemoveResponse } from '../../../types/ResourceResponse'

export interface UseRemoveResourceOptions<T extends typeof Model> {
  /**
   * The id to use by default. If an id is provided to 'remove'
   * (e.g. `remove(1)`) then this id
   * will take precedence.
   */
  id?: MaybeRefOrGetter<string | number>

  /**
   * Callback called after a successful request
   */
  onSuccess?: (response: RemoveResponse<T>) => void

  /**
   * Callback called when a standard error occurs
   */
  onStandardError?: (response: RemoveResponse<T>) => void

  /**
   * Callback called when an error occurs
   */
  onError?: (response: RemoveResponse<T>) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * When optimistic is `true`, the record is removed from
   * the store **before** it's removed from the backend.
   *
   * If after removing the record the request fails, the record
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
   * The driver used to perform the remove request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsRemover = useRemoveResources(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string
}

export interface UseRemoveResourceReturn<T extends typeof Model> {
  /**
   * Perform the `remove` request
   */
  remove: (id?: string | number) => Promise<void>

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
   * `true` while removing the data
   */
  removing: Ref<string | number | undefined>

  /**
   * Record retrieved from the latest request
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request
   */
  response: Ref<RemoveResponse<T> | undefined>

  /**
   * All active requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeRequests: Ref<Record<string | number, {
    request: Promise<RemoveResponse<T>>
  }>>
}

export type UseRemoveResource<T extends typeof Model> = (
  model: T,
  options?: UseRemoveResourceOptions<T>
) => UseRemoveResourceReturn<T>
