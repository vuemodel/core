import { Model, Repository } from 'pinia-orm'
import { MaybeRefOrGetter, Reactive, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse, DestroyResponse, UpdateResponse } from '../../../types/Response'
import { UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../../bulk-update/UseBulkUpdater'
import { UseCreatorOptions, UseCreatorReturn } from '../create/UseCreator'
import { UseDestroyerOptions, UseDestroyerReturn } from '../destroy/UseDestroyer'
import { UseIndexerOptions, UseIndexerReturn } from '../index/UseIndexer'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface UseModelOptions<T extends typeof Model> {
  /**
   * Options passed to `useBulkUpdater`
   */
  bulkUpdate?: UseBulkUpdaterOptions<T>

  /**
   * Options passed to `useCreator`
   */
  create?: UseCreatorOptions<T>

  /**
   * Options passed to `useDestroyer`
   */
  destroy?: UseDestroyerOptions<T>

  /**
   * Options passed to `useIndexer`
   */
  index?: UseIndexerOptions<T>

  /**
   * Should changes be persisted to the store?
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

export interface UseModelReturn<T extends typeof Model> {
  bulkUpdater: UseBulkUpdaterReturn<T>
  creator: UseCreatorReturn<T>
  destroyer: UseDestroyerReturn<T>
  indexer: UseIndexerReturn<T>

  /**
   * A ref of the form used to create a resource. We'll
   * likely want to model fields of this form in the UI.
   */
  createForm: UseCreatorReturn<T>['form']

  /**
   * Perform the `Create` request
   * NOTE: the "form" param is not required! You likely chose
   * to model the form in your template using `creator.form.value`.
   */
  create: UseCreatorReturn<T>['create']

  /**
   * `true` while creating a resource.
   */
  creating: UseCreatorReturn<T>['creating']

  /**
   * A boolean you may choose to use for displaying the form.
   */
  showCreateForm: Ref<boolean>

  /**
   * `true` while indexing.
   */
  indexing: UseIndexerReturn<T>['indexing']

  /**
   * Perform an index request.
   */
  index: UseIndexerReturn<T>['index']

  /**
   * Records retrieved from the latest index request.
   *
   * NOTE: These records come from `bulkUpdater.records`
   */
  records: UseBulkUpdaterReturn<T>['records']

  updateForms: UseBulkUpdaterReturn<T>['forms']

  updateFormsWithMeta: UseBulkUpdaterReturn<T>['formsWithMeta']

  showUpdateForm: Ref<boolean>

  /**
   * Go to the next page.
   *
   * NOTE: This is called on `bulkUpdater.next()`
   */
  next: UseBulkUpdaterReturn<T>['next']

  /**
   * Go to the previous page.
   *
   * NOTE: This is called on `bulkUpdater.previous()`
   */
  previous: UseBulkUpdaterReturn<T>['previous']

  pagination: UseBulkUpdaterReturn<T>['pagination']
  toPage: UseBulkUpdaterReturn<T>['toPage']
  toFirstPage: UseBulkUpdaterReturn<T>['toFirstPage']
  toLastPage: UseBulkUpdaterReturn<T>['toLastPage']
  currentPageIds: UseBulkUpdaterReturn<T>['currentPageIds']
  isFirstPage: UseBulkUpdaterReturn<T>['isFirstPage']
  isLastPage: UseBulkUpdaterReturn<T>['isLastPage']

  destroy: (id?: LoosePrimaryKey | LoosePrimaryKey[]) => Promise<DestroyResponse<T>>
  destroying: UseDestroyerReturn<T>['destroying']
  showDestroyConfirm: Ref<boolean>

  updateOrCreate: (
    (filter: UseIndexerOptions<T>['filters'], data: PiniaOrmForm<InstanceType<T>>) => Promise<UpdateResponse<T> | CreateResponse<T>>
  ) & (
    (data: PiniaOrmForm<InstanceType<T>>) => Promise<UpdateResponse<T> | CreateResponse<T>>
  )

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

export type UseModel<T extends typeof Model> = (
  model: T,
  options?: UseModelOptions<T>
) => Reactive<UseModelReturn<T>>
