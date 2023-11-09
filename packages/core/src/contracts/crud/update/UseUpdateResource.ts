import { Item, Model } from 'pinia-orm'
import { FormValidationErrors } from '../../errors/FormValidationErrors'
import { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { StandardErrors } from '../../errors/StandardErrors'
import { FindResponse, UpdateResponse } from '../../../types/ResourceResponse'

export interface UseUpdateResourceOptions<T extends typeof Model> {
  /**
   * The id to use by default. If an id is provided to 'update'
   * (e.g. `update(1)`) then this id
   * will take precedence.
   */
  id?: MaybeRefOrGetter<string | number>

  /**
   * Form used to update the resource. If not provided,
   * one will be updated for us.
   */
  form?: MaybeRef<PiniaOrmForm<InstanceType<T>>>,

  /**
   * Attempt to fill in `updater.form.value` when `updater.id.value` changes.
   *
   * ## How the form is populated
   * First, it tries to find the record in the store:
   * ```ts
   * const record = repo.find('some-id')
   * ```
   *
   * If not in the store, it tries to find it using `useFindResource`:
   * ```ts
   * await finder.find('some-id')
   * const record = repo.find('some-id')
   * ```
   */
  immediatelyMakeForm?: MaybeRefOrGetter<boolean>,

  /**
   * Callback called after a successful request
   */
  onSuccess?: (response: UpdateResponse<T>) => void

  /**
   * Callback called when an error occurs (including validation error)
   */
  onError?: (response: UpdateResponse<T>) => void

  /**
   * Callback called when an error occurs (NOT including validation error)
   */
  onStandardError?: (response: UpdateResponse<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref
   */
  onValidationError?: (response: UpdateResponse<T>,) => void

  /**
   * Should the retrieved data be persisted to the store?
   */
  persist?: MaybeRefOrGetter<boolean>

  /**
   * When `true`, the record is updated in the store **before** it's updated
   * on the backend. If after updating the resource the request
   * fails, the changes are rolled back in the store.
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
   * Update the record whenever `updater.form.value` changes
   *
   * @example
   * const updater = useUpdateResource(Todo, { autoUpdate: true })
   * updater.form.value.title = 'New Title' // triggers updater.update()
   */
  autoUpdate?: MaybeRefOrGetter<boolean>

  /**
   * Debounce `updater.update()` when using auto update
   */
  autoUpdateDebounce?: MaybeRefOrGetter<number>

  /**
   * The driver used to perform the update request.
   *
   * You may choose to think of this as the "backend".
   * For example "laravel", "strapi" or "local-storage".
   *
   * @example
   * const strapiPostsUpdater = useUpdateResources(Post, {
   *   driver: 'strapi'
   * })
   */
    driver?: string
}

export interface UseUpdateResourceReturn<T extends typeof Model> {
  /**
   * Perform the `Update` request.
   *
   * The id order of precedence is `updater.form.id -> updater.id -> updater('some-id')`
   *
   * @example
   * // When no paramaters are provided, the `updater.form` ref is used.
   * // It will attempt to discover the id with `updater.form.value.id`
   * await update()
   *
   * @example
   * // An id can be provided. A provided id takes precedence over
   * // `updater.id.value`
   * await update(5)
   *
   * @example
   * // Additional form data can be provided. these properties will
   * // be **merged** into the form (they will not replace it).
   * // Form data provided as a parameter takes precedence
   * // over `updater.form.value` data.
   * await update({ post_id: 8 })
   *
   * @example
   * // both an id and a form can be provided.
   * await update(3, { post_id: 8 })
   */
  update(id?: string | number): Promise<void>
  update(id?: string | number, form?: PiniaOrmForm<InstanceType<T>>): Promise<void>
  update(form?: PiniaOrmForm<InstanceType<T>>): Promise<void>
  /**
   * A ref of the form used to update the resource. We'll
   * likely want to model fields of this form in the UI.
   *
   * @example
   * updater.form.value.name = 'john'
   *
   * @example
   * ```html
   * <input v-model="updater.form.value.name" />
   * ```
   */
  form: Ref<PiniaOrmForm<InstanceType<T>>>

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
  validationErrors: ComputedRef<FormValidationErrors<T>>

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
   * id of the resource currently being updated
   *
   * @example
   * ```html
   * <div v-if="updater.updating.value">loading...</div>
   * ```
   */
  updating: Ref<string | number | string[] | number[] | undefined>

  /**
   * id of the resource currently being found for update. It's the id of
   * the record that will be used to populate `updater.form.value`.
   *
   * Before updating a resource, you'll likely need a prepopulated form. You can use the option
   * `makeFormWithId` for that (or call `updater.makeFormWithId('some-id')`). While populating
   * `updater.form.value`, this value is set to `true` so you may want to use it to
   * hide/disable the form while it's being populated.
   *
   * @example
   * ```html
   * <form v-if="updater.makingForm.value">
   *   <input v-model="updater.form.value.email" />
   * </form>
   * <div v-else>populating form...</div>
   * ```
   */
  makingForm: Ref<string | number | string[] | number[] | undefined>

  /**
   * Attempt to fill `updater.form.value`.
   */
  makeForm: (targetId?: string | number | string[] | number[]) => Promise<PiniaOrmForm<InstanceType<T>>>

  /**
   * Record retrieved from the latest request
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request
   */
  response: Ref<UpdateResponse<T> | undefined>

  /**
   * All active requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeRequests: Ref<Record<string | number, {
    request: Promise<UpdateResponse<T>>
    form: PiniaOrmForm<InstanceType<T>>
  }>>

  /**
   * All active "makeForm" requests keyed by `primaryKey`.
   *
   * Sometimes more than one request is being processed at once.
   * This ref keeps track of those requests.
   */
  activeMakeFormRequests: Ref<Record<string | number, {
    request: Promise<FindResponse<T>>
  }>>
}

export type UseUpdateResource<T extends typeof Model> = (
  model: T,
  options?: UseUpdateResourceOptions<T>
) => UseUpdateResourceReturn<T>
