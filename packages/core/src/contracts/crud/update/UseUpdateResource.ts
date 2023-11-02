import { Item, Model } from 'pinia-orm'
import { UpdateResource } from './UpdateResource'
import { FormValidationErrors } from '../../errors/FormValidationErrors'
import { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { StandardErrors } from '../../errors/StandardErrors'

export interface UseUpdateResourceOptions<T extends typeof Model> {
  /**
   * The id to use by default. If an id is provided to 'update'
   * (e.g. `update(1)`) then this id
   * will take precedence.
   */
  id: MaybeRefOrGetter<string | number>

  /**
   * Form used to update the resource. If not provided,
   * one will be updated for us.
   */
  form: MaybeRef<PiniaOrmForm<InstanceType<T>>>,

  /**
   * Attempt to fill in `updater.form` immediately after this composable is
   * setup. This property can take either an id or a boolean. If an id is
   * provided, it's used to discover the resource, and populate the form.
   * If a boolean is provided, if uses - in order of precedence -
   * `updater.id.value` or `updater.form.value.id`
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
  makeFormWithId?: string | number | true,

  /**
   * Callback called after a successful request
   */
  onSuccess?: (response: UpdateResource<T>) => void

  /**
   * Callback called when an error occurs (including validation error)
   */
  onError?: (
    response: UpdateResource<T>,
    validationErrors?: FormValidationErrors<InstanceType<T>>
  ) => void

  /**
   * Callback called when an error occurs (NOT including validation error)
   */
  onStandardError?: (response: UpdateResource<T>) => void

  /**
   * Callback called when a validation error occurs. Note, you
   * likely won't need to use this callback as all validation
   * errors exist within the "validationErrors" computed ref
   */
  onValidationError?: (
    response: UpdateResource<T>,
    validationErrors: FormValidationErrors<InstanceType<T>>
  ) => void

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
  validationErrors: ComputedRef<FormValidationErrors<InstanceType<T>>>

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
   *
   * @example
   * ```html
   * <div v-if="updater.updating.value">loading...</div>
   * ```
   */
  updating: Ref<boolean>

  /**
   * `true` while discovering the record that will be used to populate `updater.form.value`.
   *
   * Before updating a resource, you'll likely need a prepopulated form. You can use the option
   * `makeFormWithId` for that (or call `updater.makeFormWithId('some-id')`). While populating
   * `updater.form.value`, this value is set to `true` so you may want to use it to
   * hide/disable the form while it's being populated.
   *
   * @example
   * ```html
   * <form v-if="updater.findingRecordForUpdate.value">
   *   <input v-model="updater.form.value.email" />
   * </form>
   * <div v-else>populating form...</div>
   * ```
   */
  findingRecordForUpdate: Ref<boolean>

  /**
   * Record retrieved from the latest request
   */
  record: ComputedRef<Item<InstanceType<T>>>

  /**
   * Response of the latest request
   */
  response: Ref<UpdateResource<T> | undefined>
}

export type UseUpdateResource<T extends typeof Model> = (
  model: T,
  options?: UseUpdateResourceOptions<T>
) => UseUpdateResourceReturn<T>
