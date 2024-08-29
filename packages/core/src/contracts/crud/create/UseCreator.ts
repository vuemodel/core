import { Item, Model, Repository } from 'pinia-orm'
import { FormValidationErrors } from '../../errors/FormValidationErrors'
import { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { StandardErrors } from '../../errors/StandardErrors'
import { CreateErrorResponse, CreateResponse, CreateSuccessResponse, CreateValidationErrorResponse } from '../../../types/Response'

export interface UseCreatorOptions<T extends typeof Model> {
  /**
   * Form used to create the resource. If not provided,
   * one will be created for us.
   */
  form?: MaybeRef<PiniaOrmForm<InstanceType<T>>>,

  /**
   * Fields to be merged into the form every time a record is created.
   *
   * We can think of this as a "base form" that
   * all fields will be merged into.
   *
   * @example
   * const creator = useCreator(Comment, {
   *  merge: () => {
   *    return {
   *      post_id: props.postId
   *    }
   *  }
   * })
   */
  merge?: MaybeRefOrGetter<PiniaOrmForm<InstanceType<T>>>,

  /**
   * Callback called after a successful request.
   */
  onSuccess?: (response: CreateSuccessResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error).
   */
  onError?: (response: CreateErrorResponse<T>, validationErrors?: FormValidationErrors<T>) => void

  /**
   * Callback called when an error occurs (NOT including validation error).
   */
  onStandardError?: (response: CreateErrorResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref.
   */
  onValidationError?: (response: CreateValidationErrorResponse<T>, validationErrors: FormValidationErrors<T>) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * When `true`, the record is persisted to the store **before**
   * it's created. If after creating the resource the request
   * fails, the record is destroyed from the store.
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
   * The driver used to perform the create request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsCreater = useCreators(Post, {
   *   driver: 'strapi'
   * })
   */
  driver?: string
}

export interface UseCreatorReturn<T extends typeof Model> {
  /**
   * Perform the `Create` request
   * NOTE: the "form" param is not required! You likely chose
   * to model the form in your template using `creator.form.value`.
   */
  create: (
    /**
     * OPTIONAL! Fields of this form will have the highest precedence.
     */
    form?: PiniaOrmForm<InstanceType<T>>
  ) => Promise<CreateResponse<T>>

  /**
   * A ref of the form used to create the resource. We'll
   * likely want to model fields of this form in the UI.
   */
  form: Ref<PiniaOrmForm<InstanceType<T>>>

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
  validationErrors: ComputedRef<FormValidationErrors<T>>

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
  creating: Ref<boolean>

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
  response: Ref<CreateResponse<T> | undefined>

  /**
   * All active requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeRequests: Ref<Record<string | number, {
    request: Promise<CreateResponse<T>> & { cancel(): void }
    form: PiniaOrmForm<InstanceType<T>>
  }>>

  /**
   * Cancel the latest request.
   */
  cancel: () => void

  /**
   * The PiniaORM model used to create this composable
   */
  ModelClass: T,

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>

  /**
   * Every composable gets an id. Used internally
   * when working with events.
   */
  composableId: string
}

export type UseCreator<T extends typeof Model> = (
  model: T,
  options?: UseCreatorOptions<T>
) => UseCreatorReturn<T>
