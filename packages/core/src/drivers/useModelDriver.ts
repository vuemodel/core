import { Model } from 'pinia-orm'
import { UseModelOptions, UseModelReturn } from '../contracts/crud/use-model/UseModel'
import { generateRandomString } from '../utils/generateRandomString'
import { getDriverKey } from '../utils/getDriverKey'
import { useBulkUpdater } from '../composables/useBulkUpdater'
import { useCreator } from '../composables/useCreator'
import { useDestroyer } from '../composables/useDestroyer'
import { Ref, ref, watch } from 'vue'
import { useUpdater } from '../composables/useUpdater'
import { applyFilters } from '../utils/applyFilters'
import { useIndexer } from '../composables/useIndexer'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { LoosePrimaryKey } from '../types/LoosePrimaryKey'

const defaultOptions = {

}

export function useModelDriver<
  T extends typeof Model,
> (
  ModelClass: T,
  options?: UseModelOptions<T>,
): UseModelReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  const bulkUpdater = useBulkUpdater(driverKey, ModelClass, {
    immediatelyMakeForms: true,
    ...options.update,
    indexer: options.index,
  })
  const updateForm: Ref<PiniaOrmForm<InstanceType<T>> | null> = ref(null)
  bulkUpdater.onSuccess(() => {
    showUpdateFormId.value = false
  })

  const creator = useCreator(driverKey, ModelClass, options.create)
  creator.onSuccess(response => {
    showCreateForm.value = false

    if (!response.record) return
    const primaryKey = getRecordPrimaryKey(ModelClass, response.record)
    if (!primaryKey) return
    const recordsPerPage = bulkUpdater.pagination.value.recordsPerPage
    const numberOfRecords = bulkUpdater.forms.value.length
    if (!recordsPerPage || (numberOfRecords < recordsPerPage)
    ) {
      bulkUpdater.currentPageIds.value.push(primaryKey)
    }
  })

  const destroyer = useDestroyer(driverKey, ModelClass, options.destroy)

  const updateOrCreateIndexer = useIndexer(driverKey, ModelClass)
  const updateOrCreateUpdater = useUpdater(driverKey, ModelClass)

  const showCreateForm = ref(false)
  const showDestroyConfirmId = ref<LoosePrimaryKey | false>(false)
  const showUpdateFormId = ref<LoosePrimaryKey | false>(false)

  watch(showUpdateFormId, async (newId) => {
    if (newId) {
      bulkUpdater.makeForms([String(newId)]).then(() => {
        updateForm.value = (bulkUpdater.forms.value as any)?.[String(newId)]
      })
    } else {
      updateForm.value = null
    }
  })

  const updateOrCreate: UseModelReturn<T>['updateOrCreate'] = async (filter, data) => {
    // Try to find the record in the store
    const findRecordQuery = creator.repo.query()
    applyFilters(findRecordQuery, filter)
    const foundRecords = findRecordQuery.get()
    if (foundRecords.length > 1) {
      throw new Error(`cannot use updateOrCreate, more than one record (${foundRecords.length}) found`)
    }
    // if it exists, set "foundRecord" to that record
    let foundRecord: InstanceType<T> | DeclassifyPiniaOrmModel<InstanceType<T>> | undefined = foundRecords[0]
    // if it doesn't exist, try to find it with "updater" from "useUpdater"
    if (!foundRecord) {
      const response = await updateOrCreateIndexer.index({ filters: filter })
      const indexerFoundRecords = response.records ?? []
      if (indexerFoundRecords.length > 1) {
        throw new Error(`cannot use updateOrCreate, more than one record (${indexerFoundRecords.length}) found`)
      }
      // if found
      if (indexerFoundRecords.length === 1) {
        // set "foundRecord"
        foundRecord = indexerFoundRecords[0]
      }
    }
    // if found, update found record
    if (foundRecord) {
      return await updateOrCreateUpdater.update(getRecordPrimaryKey(ModelClass, foundRecord), data)
    }

    return await creator.create(data)
  }

  return {
    repo: creator.repo,

    /**
     * Creator
     */

    creator: {
      showForm: showCreateForm,
      form: creator.form,
      create: creator.create,
      creating: creator.creating,
      standardErrors: creator.standardErrors,
      validationErrors: creator.validationErrors,
    },

    /**
     * Bulk Updater
     */

    updater: {
      showFormId: showUpdateFormId,
      form: updateForm,
      forms: bulkUpdater.forms,
      formsKeyed: bulkUpdater.forms,
      update: bulkUpdater.update,
      index: bulkUpdater.index,
      indexing: bulkUpdater.indexing,
      isFirstPage: bulkUpdater.isFirstPage,
      isLastPage: bulkUpdater.isLastPage,
      next: bulkUpdater.next,
      pagination: bulkUpdater.pagination,
      previous: bulkUpdater.previous,
      toFirstPage: bulkUpdater.toFirstPage,
      toLastPage: bulkUpdater.toLastPage,
      toPage: bulkUpdater.toPage,
      currentPageIds: bulkUpdater.currentPageIds,
      records: bulkUpdater.records,
      updating: bulkUpdater.updating,
      meta: bulkUpdater.meta,
      standardErrors: bulkUpdater.standardErrors,
      validationErrors: bulkUpdater.validationErrors,
    },

    /**
     * Indexer
     */

    indexer: {
      cancel: bulkUpdater.indexer.cancel,
      index: bulkUpdater.indexer.index,
      indexing: bulkUpdater.indexer.indexing,
      isFirstPage: bulkUpdater.indexer.isFirstPage,
      isLastPage: bulkUpdater.indexer.isLastPage,
      makeQuery: bulkUpdater.indexer.makeQuery,
      next: bulkUpdater.indexer.next,
      pagination: bulkUpdater.indexer.pagination,
      previous: bulkUpdater.indexer.previous,
      records: bulkUpdater.indexer.records,
      standardErrors: bulkUpdater.indexer.standardErrors,
      toFirstPage: bulkUpdater.indexer.toFirstPage,
      toLastPage: bulkUpdater.indexer.toLastPage,
      toPage: bulkUpdater.indexer.toPage,
      validationErrors: bulkUpdater.indexer.validationErrors,
    },

    /**
     * Destroyer
     */

    destroyer: {
      destroy: destroyer.destroy,
      destroying: destroyer.destroying,
      showConfirmId: showDestroyConfirmId,
      standardErrors: destroyer.standardErrors,
    },

    /**
     * Misc
     */

    composableId,
    ModelClass,
    updateOrCreate,

    /**
     * Composables
     */

    composables: {
      bulkUpdater,
      indexer: bulkUpdater.indexer,
      creator,
      destroyer,
    },
  }
}
