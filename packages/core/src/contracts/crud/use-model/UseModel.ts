import { Model, Repository } from 'pinia-orm'
import { MaybeRefOrGetter, Ref } from 'vue'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { CreateResponse, UpdateResponse } from '../../../types/Response'
import { UseBulkUpdaterOptions, UseBulkUpdaterReturn } from '../../bulk-update/UseBulkUpdater'
import { UseCreatorOptions, UseCreatorReturn } from '../create/UseCreator'
import { UseDestroyerOptions, UseDestroyerReturn } from '../destroy/UseDestroyer'
import { UseIndexerOptions, UseIndexerReturn } from '../index/UseIndexer'
import { IndexFilters } from '../index/IndexFilters'
import { LoosePrimaryKey } from '../../../types/LoosePrimaryKey'

export interface UseModelOptions<T extends typeof Model> {
  /**
   * Options passed to `useBulkUpdater`
   */
  update?: UseBulkUpdaterOptions<T>

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
  creator: {
    /**
     * A ref of the form used to create a resource. We'll
     * likely want to model fields of this form in the UI.
     */
    form: UseCreatorReturn<T>['form']

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
    showForm: Ref<boolean>

    /**
     * Standard "non validation" errors
     */
    standardErrors: UseCreatorReturn<T>['standardErrors']

    /**
     * Validation errors, keyed by field name
     */
    validationErrors: UseCreatorReturn<T>['validationErrors']
  }

  updater: {
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

    formsKeyed: UseBulkUpdaterReturn<T>['forms']

    form: Ref<PiniaOrmForm<InstanceType<T>> | null>

    forms: UseBulkUpdaterReturn<T>['formsWithMeta']

    update: UseBulkUpdaterReturn<T>['update'],

    updating: UseBulkUpdaterReturn<T>['updating'],

    meta: UseBulkUpdaterReturn<T>['meta'],

    /**
     * Either false, or the id of the record to be updated
     */
    showFormId: Ref<LoosePrimaryKey | false>

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

    /**
     * Standard "non validation" errors
     */
    standardErrors: UseBulkUpdaterReturn<T>['standardErrors']

    /**
     * Validation errors, keyed by the records id
     */
    validationErrors: UseBulkUpdaterReturn<T>['validationErrors']
  }

  destroyer: {
    destroy: UseDestroyerReturn<T>['destroy']
    destroying: UseDestroyerReturn<T>['destroying']
    /**
     * Either false, or the id of the record to be destroyed
     */
    showConfirmId: Ref<LoosePrimaryKey | false>

    standardErrors: UseDestroyerReturn<T>['standardErrors']
  }

  indexer: {
    records: UseIndexerReturn<T>['records'],
    index: UseIndexerReturn<T>['index'],
    validationErrors: UseIndexerReturn<T>['validationErrors'],
    standardErrors: UseIndexerReturn<T>['standardErrors'],
    indexing: UseIndexerReturn<T>['indexing'],
    makeQuery: UseIndexerReturn<T>['makeQuery'],
    pagination: UseIndexerReturn<T>['pagination'],
    cancel: UseIndexerReturn<T>['cancel'],
    next: UseIndexerReturn<T>['next'],
    previous: UseIndexerReturn<T>['previous'],
    toPage: UseIndexerReturn<T>['toPage'],
    toFirstPage: UseIndexerReturn<T>['toFirstPage'],
    toLastPage: UseIndexerReturn<T>['toLastPage'],
    isFirstPage: UseIndexerReturn<T>['isFirstPage'],
    isLastPage: UseIndexerReturn<T>['isLastPage'],
  },

  updateOrCreate: (filter: IndexFilters<InstanceType<T>>, data: PiniaOrmForm<InstanceType<T>>) => Promise<UpdateResponse<T> | CreateResponse<T>>

  /**
   * The PiniaORM model used to create this composable
   */
  ModelClass: T,

  /**
   * The PiniaORM repo
   */
  repo: Repository<InstanceType<T>>

  composables: {
    bulkUpdater: UseBulkUpdaterReturn<T>
    creator: UseCreatorReturn<T>
    destroyer: UseDestroyerReturn<T>
    indexer: UseIndexerReturn<T>
  }

  /**
   * Every composable gets an id. Used internally
   * when working with events.
   */
  composableId: string
}

export type UseModel<T extends typeof Model> = (
  ModelClass: T,
  options?: UseModelOptions<T>
) => UseModelReturn<T>
