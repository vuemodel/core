import { Collection, Model, Relation, useRepo } from 'pinia-orm'
import { BulkUpdateForm, BulkUpdateMeta, UseBulkUpdaterOptions, UseBulkUpdaterReturn, UseBulkUpdateUpdateOptions } from '../../contracts/bulk-update/UseBulkUpdater'
import { DeclassifyPiniaOrmModel, FilterPiniaOrmModelToFieldTypes, FilterPiniaOrmModelToRelationshipTypes, getClassRelationships, RelationshipDefinition } from 'pinia-orm-helpers'
import { computed, onBeforeUnmount, ref, toValue, WatchStopHandle } from 'vue'
import { BulkUpdateErrorResponse, BulkUpdateResponse, BulkUpdateSuccessResponse, SyncResponse } from '../../types/Response'
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
import { UseIndexerOptions, UseIndexerReturn } from '../../contracts/crud/index/UseIndexer'
import omit from 'just-omit'
import { IndexWiths } from '../../contracts/crud/index/IndexWiths'
import { getDriverKey } from '../../utils/getDriverKey'
import { onSyncPersist } from '../../broadcasting/makeChannel'
import { useCallbacks } from '../../utils/useCallbacks'
import { applyWiths } from '../../utils/applyWiths'

const defaultOptions = {
  persist: true,
  excludeFields: [],
  rollbacks: true,
  syncOn: {
    indexed: true,
    created: true,
    found: true,
    updated: true,
    destroyed: true,
  },
}

export function useBulkUpdaterDriver<
  T extends typeof Model,
  RelationshipTypes = FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>,
> (
  ModelClass: T,
  options?: UseBulkUpdaterOptions<T>,
): UseBulkUpdaterReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  function getRecordPrimaryKeys (records: any[]) {
    return records.map(record => getRecordPrimaryKey(ModelClass, record) ?? '')
  }

  const bulkUpdatePersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.bulkUpdatePersist`)
  const bulkUpdatePersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.bulkUpdatePersist`)

  const syncPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.syncPersist`)
  const syncPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.syncPersist`)

  const onSuccessCallbacks = useCallbacks<[BulkUpdateSuccessResponse<T>]>([options.onSuccess])
  const onErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([options.onError])
  const onStandardErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([options.onStandardError])
  const onValidationErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([options.onValidationError])

  const forms = ref<Record<string, BulkUpdateForm<InstanceType<T>>>>(options.forms ?? {})
  const changes = ref<Record<string, BulkUpdateForm<InstanceType<T>>>>({})
  const meta = ref<Record<string, BulkUpdateMeta<T>>>({})
  const updating = ref(false)
  const activeRequests = ref<Record<string | number, {
    request: Promise<BulkUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, BulkUpdateForm<InstanceType<T>>>
      }>>({})
  const activeRequest = ref<{
    request: Promise<BulkUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, BulkUpdateForm<InstanceType<T>>>
  }>()

  const excludeFieldsResolved = options.excludeFields

  const primaryKeyField = ModelClass.primaryKey

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const currentPageIds = ref<string[]>([])

  const syncPersistHooks = deepmerge(driverConfig.hooks?.syncPersist ?? [])

  const bulkUpdatePersistHooks = deepmerge(driverConfig.hooks?.bulkUpdatePersist ?? [])

  const piniaOrmRelationships = getClassRelationships(ModelClass)
  const pivotClasses: Record<string, Model> = {}
  const belongsToManyRelationshipKeys: (keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>)[] = Object.entries(piniaOrmRelationships)
    .filter(entry => {
      const relatedInfo = entry[1] as RelationshipDefinition & { pivot?: Model }
      const PivotModel = relatedInfo.pivot
      if (PivotModel) {
        pivotClasses[PivotModel.$entity()] = PivotModel
      }
      return relatedInfo.kind === 'BelongsToMany'
    })
    .map(entry => {
      return entry[0] as keyof DeclassifyPiniaOrmModel<InstanceType<T>>
    })

  const belongsToManyRelationship = belongsToManyRelationshipKeys.map(key => {
    return piniaOrmRelationships[key]
  })

  belongsToManyRelationship.forEach((relationship) => {
    const foreignPivotKey: string = (relationship as any).foreignPivotKey
    onSyncPersist(relationship.related.constructor as any, (message) => {
      const { attached, detached, updated } = message.response
      const pivotRecords = [...attached, ...detached, ...updated]
      const foreignPivotKeys = pivotRecords.map(pivot => pivot[foreignPivotKey])
      formMaker.makeForms(foreignPivotKeys)
    })
  })

  const indexerWith = () => {
    const optionsWithsResolved: UseIndexerOptions<T>['with'] = toValue(options.indexer?.with ?? {})
    const result: Record<string, any> = optionsWithsResolved

    Object.entries(piniaOrmRelationships).forEach((entry) => {
      const relatedInfo = entry[1] as RelationshipDefinition
      const relatedKey = entry[0] as keyof DeclassifyPiniaOrmModel<InstanceType<T>>
      if (
        relatedInfo.kind === 'BelongsToMany' &&
        !optionsWithsResolved?.[relatedKey]
      ) {
        result[relatedKey] = {}
      }
    })
    return result as IndexWiths<InstanceType<T>>
  }

  const indexer = useIndexer(
    ModelClass,
    {
      ...deepmerge(
        {
          persist: true,
          driver: options.driver,
          pagination: options.pagination,
        },
        omit(options.indexer ?? {}, ['with']),
      ),
      with: indexerWith,
    },
  )

  indexer.onPaginateImmediate(response => {
    if (response.records) {
      onPaginate(response.records)
      currentPageIds.value = getRecordPrimaryKeys(response.records)
    }
  })

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
    belongsToManyRelationshipKeys,
    pivotClasses,
    piniaOrmRelationships,
    changes,
    fieldKeys,
    forms,
    formWatchers,
    meta,
    pauseAutoUpdater,
    primaryKeyField,
    repo,
    ModelClass,
    resumeAutoUpdater,
    indexer,
    driver: driverKey,
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

  const response = ref<BulkUpdateResponse<T>>()

  const belongsToManyResponses = ref<
    Record<keyof RelationshipTypes, SyncResponse<T>> |
    undefined
  >()
  const activeBelongsToManyRequests = ref<Record<
  keyof RelationshipTypes,
  (Promise<SyncResponse<T>> & { cancel(): void })
    >>({} as Record<
  keyof RelationshipTypes,
  (Promise<SyncResponse<T>> & { cancel(): void })
>)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {}
  })

  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? []
  })

  // const withBulkUpdater = Object.entries(Object.values(options.with).map(withField => {
  //   const relatedClass = ModelClass.getRelatedClass(withField)
  //   return [withField, useBulkUpdaterDriver(relatedClass)]
  // }))

  // const allRelatedForms = {
  //   posts: { 'some-user-id': formsWithMeta },
  // }

  const formsWithMeta = computed(() => {
    const currentPageForms: Record<string, BulkUpdateForm<InstanceType<T>>> = {}
    currentPageIds.value.forEach(recordId => {
      if (forms.value[recordId ?? '']) {
        currentPageForms[recordId] = forms.value[recordId ?? '']
      }
    })

    return Object.entries(currentPageForms).map(([id, form]) => {
      // const relatedForms = allRelatedForms?.formsGroupedById?.[id] ?? {})
      //   .map((formsWithMeta) => {
      //     return formsWithMeta
      //   }
      const query = repo.query()
      applyWiths(
        ModelClass,
        query,
        toValue(indexerWith),
        {
          withoutEntityGlobalScopes: options.indexer?.withoutEntityGlobalScopes,
          withoutGlobalScopes: options.indexer?.withoutGlobalScopes,
        },
      )

      return {
        id,
        record: query.find(id),
        form: form as BulkUpdateForm<InstanceType<T>>,
        // ...relatedForms,
        ...(meta.value[id] as BulkUpdateMeta<T>),
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
    currentPageIds.value = getRecordPrimaryKeys(indexer.records.value)
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

  function update (_optionsParam?: UseBulkUpdateUpdateOptions<T>) {
    /**
     * TODO: Surely we can do better than this craziness
     */
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
      belongsToManyRelationshipKeys,
      piniaOrmRelationships,
      pivotClasses,
      belongsToManyResponses,
      bulkUpdatePersistChannel,
      bulkUpdatePersistHooks,
      syncPersistHooks,
      bulkUpdatePersistEntityChannel,
      syncPersistChannel,
      syncPersistEntityChannel,
      onSuccessCallbacks,
      onErrorCallbacks,
      onStandardErrorCallbacks,
      onValidationErrorCallbacks,
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

  const index: UseIndexerReturn<T>['index'] = (...params: any[]) => {
    return indexer.index(...params).then(async response => {
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }

  const next: UseIndexerReturn<T>['next'] = () => {
    return indexer.next().then(async response => {
      onPaginate(response.records)
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }
  const previous: UseIndexerReturn<T>['previous'] = () => {
    return indexer.previous().then(response => {
      onPaginate(response.records)
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }
  const toFirstPage: UseIndexerReturn<T>['toFirstPage'] = () => {
    return indexer.toFirstPage().then(response => {
      onPaginate(response.records)
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }
  const toLastPage: UseIndexerReturn<T>['toLastPage'] = () => {
    return indexer.toLastPage().then(response => {
      onPaginate(response.records)
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }
  const toPage: UseIndexerReturn<T>['toPage'] = (pageNumber: number) => {
    return indexer.toPage(pageNumber).then(response => {
      onPaginate(response.records)
      if (response.records) {
        currentPageIds.value = getRecordPrimaryKeys(response.records)
      }
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
    belongsToManyResponses,
    activeBelongsToManyRequests,
    formsWithMeta,
    composableId,
    ModelClass,

    // Indexer
    indexer,
    index,
    indexing: indexer.indexing,
    isFirstPage: indexer.isFirstPage,
    isLastPage: indexer.isLastPage,
    pagination: indexer.pagination,
    currentPageIds,
    next,
    previous,
    toFirstPage,
    toLastPage,
    toPage,
    records: indexer.records,
    updatedRecords,

    onError: onErrorCallbacks.add,
    onStandardError: onStandardErrorCallbacks.add,
    onSuccess: onSuccessCallbacks.add,
    onValidationError: onValidationErrorCallbacks.add,
  }
}
