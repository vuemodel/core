import { Collection, Model, Repository } from 'pinia-orm'
import { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { BatchUpdateErrorResponse, BatchUpdateResponse, BatchUpdateSuccessResponse } from '../../types/Response'
import { FormValidationErrors } from '../errors/FormValidationErrors'
import { StandardErrors } from '../errors/StandardErrors'

export interface UseBatchUpdaterOptions<T extends typeof Model> {
  /**
   * Ids of the target records to update.
   */
  ids?: MaybeRefOrGetter<string[] | number[]>

  /**
   * Here you may prefill the update forms. Use an object
   * where the key is the "id" of the resource, and
   * value is the resources form.
   *
   * It's likely this field is **not required** as the
   * composable can make the forms for us
   * with `makeForms()`
   */
  forms?: MaybeRef<Record<string, PiniaOrmForm<InstanceType<T>>>>,

  /**
   * Use provided ids to immediately make the forms
   * when this composable is setup
   */
  immediatelyMakeForms?: MaybeRefOrGetter<boolean>,

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
}

export interface UseBatchUpdaterReturn<T extends typeof Model> {
  ids: Ref<string[]>
  update(forms?: Record<string, PiniaOrmForm<InstanceType<T>>>): Promise<BatchUpdateResponse<T>>
  forms: Ref<Record<string, PiniaOrmForm<InstanceType<T>>>>

  /**
   * Make a form for every record in the store
   *
   * ---
   *
   * If `targetIds` is provided:
   * - Only make forms with provided `targetIds`
   * - Make an `index()` request to find all `targetIds` that aren't already in the store
   */
  makeForms: (targetIds?: string[]) => Promise<Record<string, PiniaOrmForm<InstanceType<T>>>>

  /**
   * All records from the latest update
   */
  records: ComputedRef<Collection<InstanceType<T>>>

  /**
   *
   */
  updating: Ref<Record<string, boolean>>

  /**
   *
   */
  response: Ref<BatchUpdateResponse<T> | undefined>

  /**
   * Validation errors, keyed by the records id
   */
  validationErrors: ComputedRef<Record<string, FormValidationErrors<T>>>

  /**
   * All non-validation errors
   */
  standardErrors: ComputedRef<StandardErrors>

  /**
   * Ids of the forms being made. Only useful if records need to
   * be fetched from the backend.
   */
  makingForms: Ref<Record<string, boolean>>

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>
}

export type UseBatchUpdater<T extends typeof Model> = (
  model: T,
  options?: UseBatchUpdaterOptions<T>
) => UseBatchUpdaterReturn<T>
