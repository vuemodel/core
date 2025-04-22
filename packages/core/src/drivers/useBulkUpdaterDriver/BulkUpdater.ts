import { Collection, Model, ModelFields, Relation, Repository, useRepo } from 'pinia-orm'
import { BulkUpdateForm, BulkUpdateMeta, UseBulkUpdaterOptions, UseBulkUpdaterReturn, UseBulkUpdateUpdateOptions } from '../../contracts/bulk-update/UseBulkUpdater'
import { DeclassifyPiniaOrmModel, FilterPiniaOrmModelToFieldTypes, FilterPiniaOrmModelToRelationshipTypes, getClassRelationships, RelationshipDefinition } from 'pinia-orm-helpers'
import { computed, getCurrentScope, onScopeDispose, Ref, ref, toValue, WatchStopHandle } from 'vue'
import { BulkUpdateErrorResponse, BulkUpdateResponse, BulkUpdateSuccessResponse, IndexResponse, SyncResponse } from '../../types/Response'
import { generateRandomString } from '../../utils/generateRandomString'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { useFormMaker } from './useFormMaker'
import { UseIndexerOptions, UseIndexerReturn } from '../../contracts/crud/index/UseIndexer'
import { IndexWiths } from '../../contracts/crud/index/IndexWiths'
import { getDriverKey } from '../../utils/getDriverKey'
import { useCallbacks, UseCallbacksReturn } from '../../utils/useCallbacks'
import { BulkUpdatePersistHookPayload, SyncPersistHookPayload } from '../../hooks/Hooks'
import { VueModelConfig } from '../../plugin/state'
import { useBulkUpdaterDriver } from './useBulkUpdaterDriver'
import { debounce } from 'debounce'
import { performUpdate } from './performUpdate'
import { getMergedDriverConfig } from '../../utils/getMergedDriverConfig'
import { Constructor } from '../../types/Constructor'
import { deepmerge } from 'deepmerge-ts'
import { useIndexer } from '../../composables/useIndexer'
import omit from 'just-omit'
import { watchPausable } from '../../utils/watchPausable'
import { useFormSyncer } from './useFormSyncer'

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

export class BulkUpdater<T extends typeof Model> {
  composableId = generateRandomString(8)

  driverKey!: string
  entity!: string

  // Broadcast Channels
  broadcastChannelPrefix!: string
  bulkUpdatePersistChannel!: BroadcastChannel
  bulkUpdatePersistEntityChannel!: BroadcastChannel
  syncPersistChannel!: BroadcastChannel
  syncPersistEntityChannel!: BroadcastChannel

  // Callbacks
  onSuccessCallbacks!: UseCallbacksReturn<[BulkUpdateSuccessResponse<T>]>
  onErrorCallbacks!: UseCallbacksReturn<[BulkUpdateErrorResponse<T>]>
  onStandardErrorCallbacks!: UseCallbacksReturn<[BulkUpdateErrorResponse<T>]>
  onValidationErrorCallbacks!: UseCallbacksReturn<[BulkUpdateErrorResponse<T>]>

  // Form
  formsKeyed!: Ref<Record<string, BulkUpdateForm<InstanceType<T>>>>
  changes = ref<Record<string, BulkUpdateForm<InstanceType<T>>>>({})
  formWatchers: Record<string, WatchStopHandle> = {}
  formMaker!: ReturnType<typeof useFormMaker>

  // Debouncing

  // Meta
  meta = ref<Record<string, BulkUpdateMeta<InstanceType<T>>>>({})
  updating = ref<boolean>(false)

  // Requests
  activeRequests = ref<Record<string | number, {
    request: Promise<BulkUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, BulkUpdateForm<InstanceType<T>>>
      }>>({})

  activeRequest = ref<{
    request: Promise<BulkUpdateResponse<T>> & { cancel(): void }
    forms: Record<string, BulkUpdateForm<InstanceType<T>>>
  } | undefined>()

  excludeFieldsResolved: string[] | undefined
  primaryKeyField!: string | string[]
  driverConfig!: VueModelConfig

  // Pinia ORM
  repo!: Repository<InstanceType<T>>
  fields!: ModelFields

  // Pagination
  currentPageIds = ref<string[]>([])

  // Hooks
  syncPersistHooks!: ((payload: SyncPersistHookPayload) => Promise<void> | void)[]
  bulkUpdatePersistHooks!: ((payload: BulkUpdatePersistHookPayload) => Promise<void> | void)[]

  // Insight
  piniaOrmRelationships!: ReturnType<typeof getClassRelationships>
  pivotClasses: Record<string, Model> = {}
  belongsToManyRelationshipKeys!: (keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>)[]
  belongsToManyRelationships!: Record<string, RelationshipDefinition>[]

  indexer!: UseIndexerReturn<T>
  fieldKeys!: (keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>)[]

  // Auto Update
  pauseAutoUpdater!: () => void
  resumeAutoUpdater!: () => void

  // Errors
  readonly validationErrors = computed(() => {
    return this.response.value?.validationErrors ?? {}
  })

  readonly standardErrors = computed(() => {
    return this.response.value?.standardErrors ?? []
  })

  readonly response = ref<BulkUpdateResponse<T> | undefined>()
  withBulkUpdaters!: Record<string, { composable: UseBulkUpdaterReturn, isMany: boolean }>

  belongsToManyResponses = ref<Record<keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>, SyncResponse<T>> | undefined>()
  activeBelongsToManyRequests: Ref<Record<keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>, (Promise<SyncResponse<T>> & { cancel(): void })>> = ref<Record<keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>, (Promise<SyncResponse<T>> & { cancel(): void })>>({})

  private setWithBulkUpdaters () {
    this.withBulkUpdaters = Object.fromEntries(Object.keys(toValue(this.options.indexer?.with) ?? {}).map(withField => {
      const relationshipsInfo = (this.piniaOrmRelationships! as any)[withField]
      const relatedClass = relationshipsInfo.related.constructor

      return [withField, {
        composable: useBulkUpdaterDriver(relatedClass, {
          autoUpdate: true,
          immediatelyMakeForms: true,
          indexer: {
            /** @ts-expect-error hard to type, not worth it */
            with: () => toValue(this.indexerWith)[withField] as IndexWiths<Model>,
          },
        }),
        isMany: ['HasMany', 'BelongsToMany'].includes(relationshipsInfo.kind),
      }]
    }))

    return this
  }

  private mergeOptions () {
    this.options = Object.assign({}, defaultOptions, this.options)
    return this
  }

  private setDriverKey () {
    this.driverKey = getDriverKey(this.options.driver)
    return this
  }

  private setupBroadcastChannels () {
    const prefix = `vuemodel.${this.driverKey}`
    this.broadcastChannelPrefix = prefix

    this.bulkUpdatePersistChannel = new BroadcastChannel(`${prefix}.bulkUpdatePersist`)
    this.bulkUpdatePersistEntityChannel = new BroadcastChannel(`${prefix}.${this.entity}.bulkUpdatePersist`)
    this.syncPersistChannel = new BroadcastChannel(`${prefix}.syncPersist`)
    this.syncPersistEntityChannel = new BroadcastChannel(`${prefix}.${this.entity}.syncPersist`)

    return this
  }

  private setEntity () {
    this.entity = this.ModelClass.entity
    return this
  }

  private setupCallbacks () {
    this.onSuccessCallbacks = useCallbacks<[BulkUpdateSuccessResponse<T>]>([this.options.onSuccess])
    this.onErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([this.options.onError])
    this.onStandardErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([this.options.onStandardError])
    this.onValidationErrorCallbacks = useCallbacks<[BulkUpdateErrorResponse<T>]>([this.options.onValidationError])

    return this
  }

  private setupHooks () {
    this.syncPersistHooks = deepmerge(this.driverConfig.hooks?.syncPersist ?? [])
    this.bulkUpdatePersistHooks = deepmerge(this.driverConfig.hooks?.bulkUpdatePersist ?? [])
    return this
  }

  private setFormsKeyed () {
    this.formsKeyed = ref(this.options.forms ?? {})
    return this
  }

  private setupFormMaker () {
    this.formMaker = useFormMaker(this.ModelClass, this)
    return this
  }

  private setFieldKeys () {
    this.fieldKeys = Object.entries(this.fields)
      .filter(entry => {
        return !this.excludeFieldsResolved
          ?.includes(entry[0]) &&
          !(entry[1] instanceof Relation)
      })
      .map(entry => entry[0]) as (keyof FilterPiniaOrmModelToFieldTypes<InstanceType<T>>)[]
    return this
  }

  setPrimaryKeyField () {
    this.primaryKeyField = this.ModelClass.primaryKey
    return this
  }

  setDriverConfig () {
    this.driverConfig = getMergedDriverConfig(this.options.driver)
    return this
  }

  setRepo () {
    this.repo = useRepo<InstanceType<T>>(
      this.ModelClass as unknown as Constructor<InstanceType<T>>,
      this.driverConfig.pinia,
    )
    return this
  }

  setFields () {
    this.fields = (new this.ModelClass()).$fields()
    return this
  }

  setPiniaOrmRelationships () {
    this.piniaOrmRelationships = getClassRelationships(this.ModelClass)
    return this
  }

  setBelongsToManyRelationshipKeys () {
    this.belongsToManyRelationshipKeys = Object.entries(this.piniaOrmRelationships)
      .filter(entry => {
        const relatedInfo = entry[1] as RelationshipDefinition & { pivot?: Model }
        const PivotModel = relatedInfo.pivot
        if (PivotModel) {
          this.pivotClasses[PivotModel.$entity()] = PivotModel
        }
        return relatedInfo.kind === 'BelongsToMany'
      })
      .map(entry => {
        return entry[0] as keyof DeclassifyPiniaOrmModel<InstanceType<T>>
      })

    return this
  }

  setBelongsToManyRelationships () {
    this.belongsToManyRelationships = this.belongsToManyRelationshipKeys.map((key: string) => {
      return (this.piniaOrmRelationships as any)[key]
    })
    return this
  }

  setIndexer () {
    this.indexer = useIndexer(
      this.ModelClass,
      {
        ...deepmerge(
          {
            persist: true,
            driver: this.options.driver,
            pagination: this.options.pagination,
          },
          omit(this.options.indexer ?? {}, ['with']),
        ),
        with: this.indexerWith,
      },
    )

    return this
  }

  private setupPausableAutoUpdater () {
    const updateDebounceWatchPausable = watchPausable(this.formsKeyed, () => {
      if (toValue(this.options?.autoUpdate)) {
        this.updateDebounced?.value()
      }
    }, { deep: true })

    this.pauseAutoUpdater = updateDebounceWatchPausable.pause
    this.resumeAutoUpdater = updateDebounceWatchPausable.resume

    return this
  }

  private handleCleanup () {
    if (getCurrentScope()) {
      onScopeDispose(() => {
        Object.values(this.formWatchers).forEach(unwatch => {
          unwatch()
        })
      }, true)
    }

    return this
  }

  private setupFormSyncer () {
    useFormSyncer(this)

    return this
  }

  constructor (public ModelClass: T, public options: UseBulkUpdaterOptions<T> = {}) {
    this.mergeOptions()
      // Set properties
      .setEntity()
      .setDriverConfig()
      .setRepo()
      .setPrimaryKeyField()
      .setWithBulkUpdaters()
      .setDriverKey()
      .setFormsKeyed()
      .setPiniaOrmRelationships()
      .setBelongsToManyRelationshipKeys()
      .setBelongsToManyRelationships()
      .setFields()
      .setFieldKeys()
      .setIndexer()
      // Setup categories of properties
      .setupBroadcastChannels()
      .setupCallbacks()
      .setupPausableAutoUpdater()
      .setupHooks()
      .setupFormMaker()
      .setupFormSyncer()
      // cleanup
      .handleCleanup()

    if (toValue(options.immediatelyMakeForms)) {
      this.indexAndMakeForms()
    }
  }

  index (...params: any[]) {
    return this.indexer.index(...params).then(async response => {
      if (response.records) {
        this.currentPageIds.value = this.getRecordPrimaryKeys(response.records)
      }
      return response
    })
  }

  public getRecordPrimaryKeys (records: any[]) {
    return records.map(record => getRecordPrimaryKey(this.ModelClass, record) ?? '')
  }

  updatedRecords = computed<Collection<InstanceType<T>>>(() => {
    return this.repo.find(this.response.value?.records?.map(record => getRecordPrimaryKey(this.ModelClass, record) ?? '') ?? [])
  })

  removeForm (recordId: string) {
    this.formWatchers[recordId]?.()
    delete this.changes.value[recordId]
    delete this.meta.value[recordId]
    delete this.formsKeyed.value[recordId]
  }

  public forms = computed(() => {
    const currentPageForms: Record<string, BulkUpdateForm<InstanceType<T>>> = {}
    this.currentPageIds.value.forEach(recordId => {
      if (this.formsKeyed.value[recordId ?? '']) {
        currentPageForms[recordId] = this.formsKeyed.value[recordId ?? '']
      }
    })

    return Object.entries(currentPageForms).map(([id]) => {
      return (this.meta.value[id] as BulkUpdateMeta<InstanceType<T>>)
    })
  })

  debounceMs = computed(() => {
    return toValue(this.options.autoUpdateDebounce) ?? toValue(this.driverConfig.autoUpdateDebounce) ?? 150
  })

  updateDebounced = computed(() => {
    return debounce(this.update.bind(this), toValue(this.debounceMs))
  })

  update (_optionsParam?: UseBulkUpdateUpdateOptions<T>): Promise<BulkUpdateResponse<T>> {
    return performUpdate(_optionsParam ?? {}, this)
  }

  indexerWith = () => {
    const optionsWithsResolved: UseIndexerOptions<T>['with'] = toValue(this.options.indexer?.with ?? {})
    const result: Record<string, any> = optionsWithsResolved

    Object.entries(this.piniaOrmRelationships).forEach((entry) => {
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

  async indexAndMakeForms () {
    await this.indexer.index()
    await this.formMaker.makeForms()
    this.currentPageIds.value = this.getRecordPrimaryKeys(this.indexer.records.value)
  }

  getPrimaryKeysFromRecords (records: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []) {
    return records.map(record => {
      const recordPrimaryKey = getRecordPrimaryKey(this.ModelClass, record)
      return recordPrimaryKey as string
    }) ?? []
  }

  setCurrentPageIdsWithResponse (response: IndexResponse<T>) {
    if (response.records) {
      this.currentPageIds.value = this.getRecordPrimaryKeys(response.records)
    }

    return this
  }

  handlePaginated (response: IndexResponse<T>) {
    const primarykeys = this.getPrimaryKeysFromRecords(response.records ?? [])
    this.setCurrentPageIdsWithResponse(response)
    this.formMaker.makeForms(primarykeys)

    return this
  }

  next () {
    return this.indexer.next().then(async response => {
      this.handlePaginated(response)
      return response
    })
  }

  previous () {
    return this.indexer.previous().then(response => {
      this.handlePaginated(response)
      return response
    })
  }

  toFirstPage () {
    return this.indexer.toFirstPage().then(response => {
      this.handlePaginated(response)
      return response
    })
  }

  toLastPage () {
    return this.indexer.toLastPage().then(response => {
      this.handlePaginated(response)
      return response
    })
  }

  toPage (pageNumber: number) {
    return this.indexer.toPage(pageNumber).then(response => {
      this.handlePaginated(response)
      return response
    })
  }
}
