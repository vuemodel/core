import { Collection, Model, Relation, useRepo } from 'pinia-orm'
import { BatchUpdateMeta, UseBatchUpdaterOptions, UseBatchUpdaterReturn, UseBatchUpdateUpdateOptions } from '../../contracts/batch-update/UseBatchUpdater'
import { DeclassifyPiniaOrmModel, FilterPiniaOrmModelToFieldTypes, PiniaOrmForm } from 'pinia-orm-helpers'
import { computed, onBeforeUnmount, ref, toValue, WatchStopHandle } from 'vue'
import { BatchUpdateResponse } from '../../types/Response'
import { getMergedDriverConfig } from '../../utils/getMergedDriverConfig'
import { Constructor } from '../../types/Constructor'
import { generateRandomString } from '../../utils/generateRandomString'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import debounce from 'debounce'
import { watchPausable } from '@vueuse/core'
import { useIndexer } from '../../composables/useIndexer'
import { deepmerge } from 'deepmerge-ts'
import { useFormMaker } from './useFormMaker'
import { performUpdate } from './performUpdate'
import { useFormSyncer } from './useFormSyncer'
import { UseIndexerReturn } from '../../contracts/crud/index/UseIndexer'

const defaultOptions = {
  persist: true,
  excludeFields: [],
  syncOn: {
    indexed: true,
    created: true,
    found: true,
    updated: true,
    destroyed: true,
  },
}

export function useBatchUpdaterDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseBatchUpdaterOptions<T>,
): UseBatchUpdaterReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)

  const forms = ref<Record<string, PiniaOrmForm<InstanceType<T>>>>(options.forms ?? {})
  const changes = ref<Record<string, PiniaOrmForm<InstanceType<T>>>>({})
  const meta = ref<Record<string, BatchUpdateMeta<InstanceType<T>>>>({})
  const updating = ref(false)
  const activeRequests = ref<Record<string | number, {
    request: Promise<BatchUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, PiniaOrmForm<InstanceType<T>>>
      }>>({})
  const activeRequest = ref<{
    request: Promise<BatchUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, PiniaOrmForm<InstanceType<T>>>
  }>()

  const excludeFieldsResolved = options.excludeFields

  const primaryKeyField = ModelClass.primaryKey

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const indexer = useIndexer(
    ModelClass,
    deepmerge({
      persist: true,
      driver: options.driver,
      pagination: options.pagination,
    }, options.indexer ?? {}),
  )

  const fields = (new ModelClass()).$fields()
  const fieldKeys = Object.entries(fields)
    .filter(entry => {
      return !excludeFieldsResolved?.includes(entry[0]) && !(entry[1] instanceof Relation)
    })
    .map(entry => entry[0]) as (keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>)[]

  const formWatchers: Record<string, WatchStopHandle> = {}

  const {
    pause: pauseAutoUpdater,
    resume: resumeAutoUpdater,
  } = watchPausable(forms, () => {
    if (toValue(options?.autoUpdate)) {
      updateDebounced.value()
    }
  }, { deep: true })

  const formMaker = useFormMaker({
    changes,
    fieldKeys,
    forms,
    formWatchers,
    meta,
    pauseAutoUpdater,
    primaryKeyField,
    repo,
    resumeAutoUpdater,
    indexer,
  })

  if (options.forms) formMaker.addRawForms(options.forms)

  const updatedRecords = computed<Collection<InstanceType<T>>>(() => {
    return repo.find(response.value?.records?.map(record => getRecordPrimaryKey(ModelClass, record) ?? '') ?? [])
  })

  onBeforeUnmount(() => {
    Object.values(formWatchers).forEach(unwatch => {
      unwatch()
    })
  })

  function removeForm (recordId: string) {
    formWatchers[recordId]()
    delete changes.value[recordId]
    delete meta.value[recordId]
    delete forms.value[recordId]
  }

  const response = ref<BatchUpdateResponse<T>>()

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {}
  })

  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? []
  })

  // const withBatchUpdater = Object.entries(Object.values(options.with).map(withField => {
  //   const relatedClass = ModelClass.getRelatedClass(withField)
  //   return [withField, useBatchUpdaterDriver(relatedClass)]
  // }))

  // const allRelatedForms = {
  //   posts: { 'some-user-id': formsWithMeta },
  // }

  const formsWithMeta = computed(() => {
    const currentPageForms: Record<string, PiniaOrmForm<InstanceType<T>>> = {}
    indexer.records.value.forEach(record => {
      const recordPrimaryKey = getRecordPrimaryKey(ModelClass, record)
      if (forms.value[recordPrimaryKey ?? '']) {
        /* @ts-expect-error hard to type, no benefit */
        currentPageForms[recordPrimaryKey] = forms.value[recordPrimaryKey ?? '']
      }
    })

    return Object.entries(currentPageForms).map(([id, form]) => {
      // const relatedForms = allRelatedForms?.formsGroupedById?.[id] ?? {})
      //   .map((formsWithMeta) => {
      //     return formsWithMeta
      //   }

      return {
        id,
        form,
        // ...relatedForms,
        ...(meta.value[id] as BatchUpdateMeta<InstanceType<T>>),
      }
    })
  })

  const debounceMs = computed(() => {
    return toValue(options?.autoUpdateDebounce) ?? toValue(driverConfig.autoUpdateDebounce) ?? 150
  })

  const updateDebounced = computed(() => {
    return debounce(update, toValue(debounceMs))
  })

  async function indexAndMakeForms () {
    await indexer.index()
    await formMaker.makeForms()
  }

  if (toValue(options.immediatelyMakeForms)) {
    indexAndMakeForms()
  }

  useFormSyncer({
    makeForms: formMaker.makeForms,
    ModelClass,
    removeForm,
    syncOn: options.syncOn,
    indexer,
  })

  function update (_optionsParam?: UseBatchUpdateUpdateOptions<T>) {
    return performUpdate(_optionsParam ?? {}, {
      activeRequest,
      activeRequests,
      changes,
      forms,
      meta,
      ModelClass,
      options,
      repo,
      response,
      updating,
      formMaker,
    })
  }

  function getPrimaryKeysFromRecords (records: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []) {
    return records.map(record => {
      const recordPrimaryKey = getRecordPrimaryKey(ModelClass, record)
      return recordPrimaryKey as string
    }) ?? []
  }

  async function onPaginate (records: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []) {
    const primarykeys = getPrimaryKeysFromRecords(records)
    formMaker.makeForms(primarykeys)
  }

  const next: UseIndexerReturn<T>['next'] = () => {
    return indexer.next().then(async response => {
      onPaginate(response.records)
      return response
    })
  }
  const previous: UseIndexerReturn<T>['previous'] = () => {
    return indexer.previous().then(response => {
      onPaginate(response.records)
      return response
    })
  }
  const toFirstPage: UseIndexerReturn<T>['toFirstPage'] = () => {
    return indexer.toFirstPage().then(response => {
      onPaginate(response.records)
      return response
    })
  }
  const toLastPage: UseIndexerReturn<T>['toLastPage'] = () => {
    return indexer.toLastPage().then(response => {
      onPaginate(response.records)
      return response
    })
  }
  const toPage: UseIndexerReturn<T>['toPage'] = (pageNumber: number) => {
    return indexer.toPage(pageNumber).then(response => {
      onPaginate(response.records)
      return response
    })
  }

  return {
    update,
    forms,
    changes,
    makeForms: formMaker.makeForms,
    removeForm,
    updating,
    response,
    validationErrors,
    standardErrors,
    meta,
    repo,
    activeRequest,
    activeRequests,
    formsWithMeta,
    composableId,
    ModelClass,

    // Indexer
    indexer,
    index: indexer.index,
    indexing: indexer.indexing,
    isFirstPage: indexer.isFirstPage,
    isLastPage: indexer.isLastPage,
    pagination: indexer.pagination,
    next,
    previous,
    toFirstPage,
    toLastPage,
    toPage,
    records: indexer.records,
    updatedRecords,
  }
}
