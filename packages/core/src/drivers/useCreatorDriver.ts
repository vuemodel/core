import { Model, PrimaryKey, useRepo } from 'pinia-orm'
import { Ref, computed, ref, toValue } from 'vue'
import { DeclassifyPiniaOrmModel, FilterPiniaOrmModelToRelationshipTypes, getClassRelationships, PiniaOrmForm, RelationshipDefinition } from 'pinia-orm-helpers'
import { UseCreatorOptions, UseCreatorReturn } from '../contracts/crud/create/UseCreator'
import { CreateErrorResponse, CreateResponse, CreateSuccessResponse, CreateValidationErrorResponse, SyncResponse } from '../types/Response'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { getFirstDefined } from '../utils/getFirstDefined'
import clone from 'just-clone'
import { create as createResource } from '../actions/create'
import { getDriverKey } from '../utils/getDriverKey'
import { generateRandomString } from '../utils/generateRandomString'
import { makeId } from '../utils/makeId'
import { OnCreateOptimisticPersistMessage, OnCreatePersistMessage, OnSyncPersistMessage } from '../broadcasting/BroadcastMessages'
import { deepmerge } from 'deepmerge-ts'
import { useCallbacks } from '../utils/useCallbacks'
import { sync } from '../actions/sync'
import { Form } from '..'

const defaultOptions = {
  persist: true,
}

export function useCreatorDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseCreatorOptions<T>,
): UseCreatorReturn<T> {
  type SyncRequests = Record<
    keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>,
    {
      request: (Promise<SyncResponse<T>> & { cancel(): void }),
      foreignId: string,
      relatedKey: string,
      PivotModel: Model
    }
  >

  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  const createOptimisticPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.createOptimisticPersist`)
  const createOptimisticPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.createOptimisticPersist`)
  const createPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.createPersist`)
  const createPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.createPersist`)

  const syncPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.syncPersist`)
  const syncPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.syncPersist`)

  const onSuccessCallbacks = useCallbacks<[CreateSuccessResponse<T>]>([options.onSuccess])
  const onStandardErrorCallbacks = useCallbacks<[CreateErrorResponse<T>]>([options.onStandardError])
  const onValidationErrorCallbacks = useCallbacks<[CreateValidationErrorResponse<T>, FormValidationErrors<InstanceType<T>>]>([options.onValidationError])
  const onErrorCallbacks = useCallbacks<[CreateErrorResponse<T>, FormValidationErrors<InstanceType<T>>]>([options.onError])

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const pivotClasses: Record<string, Model> = {}
  const piniaOrmRelationships = getClassRelationships(ModelClass)

  const belongsToManyRelationshipKeys = Object.entries(piniaOrmRelationships)
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

  const belongsToManyResponses = ref<Record<keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>, SyncResponse<T>> | undefined>()

  const createPersistHooks = deepmerge(driverConfig.hooks?.createPersist ?? [])
  const createOptimisticPersistHooks = deepmerge(driverConfig.hooks?.createOptimisticPersist ?? [])
  const syncPersistHooks = deepmerge(driverConfig.hooks?.syncPersist ?? [])

  const form = ref(options.form ?? {}) as Ref<PiniaOrmForm<InstanceType<T>>>

  const activeRequests = ref<UseCreatorReturn<T>['activeRequests']>({} as UseCreatorReturn<T>['activeRequests'])
  const activeRequest = ref<Promise<CreateResponse<T>> & { cancel(): void }>()

  function cancel () {
    activeRequest.value?.cancel()
  }
  const response = ref<CreateResponse<T>>()

  const creating = ref(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as FormValidationErrors<InstanceType<T>>
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const optimisticRecord = ref<InstanceType<T>>()

  function getRecordId (rawRecord: PiniaOrmForm<InstanceType<T>> | DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>) {
    const primaryKeyField = ModelClass.primaryKey
    if (Array.isArray(primaryKeyField)) {
      const key = pick(rawRecord, primaryKeyField as unknown as (keyof typeof rawRecord)[])
      return key ? String(key) : undefined
    }

    const key = rawRecord?.[primaryKeyField as unknown as (keyof typeof rawRecord)]
    return key ? String(key) : undefined
  }

  function getRecordFromRepo (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const id = getRecordPrimaryKey(ModelClass, rawRecord)
    return id ? repo.find(id) : null
  }

  const record = computed(() => {
    if (!response.value && !!optimisticRecord.value) {
      return getRecordFromRepo(optimisticRecord.value)
    }

    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return getRecordFromRepo(responseRecord)
  })

  async function create (paramForm?: PiniaOrmForm<InstanceType<T>>) {
    response.value = undefined
    optimisticRecord.value = undefined
    belongsToManyResponses.value = {}

    const mergedForm = Object.assign(
      {},
      toValue(options?.merge) ?? {},
      form.value,
      toValue(options?.form) ?? {},
      paramForm ?? {},
    ) as PiniaOrmForm<InstanceType<T>> & { id: PrimaryKey }

    const persist = !!toValue(options?.persist)
    const optimistic = getFirstDefined<boolean>([toValue(options?.optimistic), driverConfig.optimistic]) &&
      persist

    let requestId = getRecordId(mergedForm)
    const primaryKey = ModelClass.primaryKey
    if (!requestId) {
      requestId = makeId(ModelClass, driverConfig)
      // @ts-expect-error we know primaryKey is a property on mergedForm
      mergedForm[primaryKey] = requestId
    }

    let thisOptimisticRecord: InstanceType<T> | undefined
    if (optimistic && persist) {
      thisOptimisticRecord = repo.insert(mergedForm)
      optimisticRecord.value = thisOptimisticRecord

      const createPersistMessage: OnCreateOptimisticPersistMessage<T> = clone({
        entity: ModelClass.entity,
        form: mergedForm,
      })

      createOptimisticPersistHooks.forEach(async hook => await hook({
        ModelClass,
        entity: ModelClass.entity,
        form: mergedForm,
      }))

      createOptimisticPersistChannel.postMessage(createPersistMessage)
      createOptimisticPersistEntityChannel.postMessage(createPersistMessage)
    } else {
      thisOptimisticRecord = undefined
    }

    const formWithoutPivotRelationships = Object.fromEntries(Object.entries(mergedForm).filter(entry => {
      return !belongsToManyRelationshipKeys.includes(entry[0] as any)
    })) as Form<InstanceType<T>>

    const controller = new AbortController()
    const signal = controller.signal

    creating.value = true
    const request = createResource(
      ModelClass,
      formWithoutPivotRelationships,
      {
        driver: driverKey,
        notifyOnError: options?.notifyOnError,
        signal,
        throw: false,
      },
    ) as Promise<CreateResponse<T>> & { cancel(): void }

    request.cancel = () => {
      controller.abort()
    }

    activeRequests.value[requestId] = { request, form: clone(mergedForm) }

    activeRequest.value = request

    const thisResponse = await request
    activeRequest.value = undefined

    response.value = thisResponse
    const syncRequests: SyncRequests = {} as SyncRequests

    // Many to Many syncs
    let hasManyToManyValidationErrors = false
    let hasManyToManyStandardErrors = false
    let hasManyToManyError = false

    if (response.value.success) {
      const parentPrimaryKey = getRecordPrimaryKey(ModelClass, response.value.record as any) as keyof SyncRequests

      for (const relatedKey of belongsToManyRelationshipKeys ?? []) {
        const pivotRecords = (form.value as any)?.[relatedKey]
        if (!pivotRecords) continue

        if (Object.values(pivotRecords)?.length) {
          const request = sync(ModelClass, parentPrimaryKey as string, relatedKey as any, pivotRecords) as Promise<SyncResponse<T>> & { cancel(): void }
          request.cancel = () => {
            controller.abort()
          }
          syncRequests[parentPrimaryKey] = {
            PivotModel: ((piniaOrmRelationships as any)[relatedKey]).pivot,
            relatedKey,
            foreignId: String(parentPrimaryKey),
            request: request.then(response => {
              (belongsToManyResponses.value as any)[parentPrimaryKey] = response

              return response
            }) as any,
          }
        }
      }
    }

    let syncResponses: SyncResponse<typeof Model>[] = []

    try {
      syncResponses = await Promise.all(Object.values(syncRequests).map((context: any) => context.request))
    } catch (e) {
      console.error(`Sync error when syncing records for ${ModelClass.entity}`, e)
    }

    const syncRequestEntries = Object.entries(syncRequests)

    syncResponses.forEach((syncResponse, index) => {
      const syncRequest = syncRequestEntries[index][1]
      /** @ts-expect-error PivotModel doesn't exist for some reason */
      const PivotClass = syncRequest.PivotModel.constructor
      const pivotRepo = useRepo<Model>(PivotClass)
      // Persisting to the store
      // On Success
      if (syncResponse.success) {
        const destroyIds = syncResponse.detached?.map<string>(record => {
          return getRecordPrimaryKey(PivotClass, record) ?? ''
        })

        pivotRepo.destroy(destroyIds)
        pivotRepo.save(syncResponse.attached)
        pivotRepo.save(syncResponse.updated)

        if (syncResponse.success) {
          const syncPersistMessage: OnSyncPersistMessage = clone({
            entity: ModelClass.entity,
            response: syncResponse,
            related: PivotClass.entity,
          })

          syncPersistHooks.forEach(async hook => await hook({
            ModelClass,
            entity: ModelClass.entity,
            response: syncResponse,
            related: PivotClass.entity,
          }))

          syncPersistChannel.postMessage(syncPersistMessage)
          syncPersistEntityChannel.postMessage(syncPersistMessage)
        }
      }

      if (!syncResponse.success) {
        hasManyToManyError = true

        if (Object.values(syncResponse?.validationErrors ?? {}).length) {
          hasManyToManyValidationErrors = true
        }

        if (syncResponse.standardErrors?.length) {
          hasManyToManyStandardErrors = true
        }
      }
    })

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo.insert(thisResponse.record)

      if (thisResponse.success) {
        const createPersistMessage: OnCreatePersistMessage<T> = clone({
          entity: ModelClass.entity,
          response: thisResponse,
        })

        createPersistHooks.forEach(async hook => await hook({
          ModelClass,
          entity: ModelClass.entity,
          response: thisResponse,
        }))

        createPersistChannel.postMessage(createPersistMessage)
        createPersistEntityChannel.postMessage(createPersistMessage)
      }
    }

    // Merging has many errors into the response
    if (hasManyToManyError) {
      thisResponse.success = false
      if (hasManyToManyStandardErrors) {
        if (!thisResponse.standardErrors) {
          thisResponse.standardErrors = undefined
        }
        syncResponses.forEach(syncResponse => {
          if (syncResponse.standardErrors?.length) {
            thisResponse.standardErrors?.push(...syncResponse.standardErrors)
          }
        })
      }
      if (hasManyToManyValidationErrors) {
        if (!thisResponse.validationErrors) {
          thisResponse.validationErrors = {} as any
        }
        syncResponses.forEach((syncResponse, index) => {
          if (
            syncResponse.success === false &&
          Object.keys(syncResponse?.validationErrors)?.length
          ) {
            const syncRequest = syncRequestEntries[index]
            const relatedKey = syncRequest[0] as keyof FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>
            if (thisResponse.validationErrors) {
              thisResponse.validationErrors[relatedKey] = syncResponse.validationErrors as any
            }
          }
        })
      }
    }

    // On Success
    if (thisResponse?.success) {
      if (Object.keys(activeRequests.value).length <= 1) { form.value = {} }
      if (thisResponse) {
        onSuccessCallbacks.run(thisResponse)
      }
    }

    // On validation error
    if (thisResponse.validationErrors && !thisResponse.success) {
      onValidationErrorCallbacks.run(thisResponse, thisResponse.validationErrors)
    }

    // On standard error
    if (thisResponse.standardErrors) {
      onStandardErrorCallbacks.run(thisResponse)
    }

    // On Error
    if (
      !thisResponse?.success
    ) {
      if (optimistic && thisOptimisticRecord) {
        repo.destroy(requestId)
      }
      onErrorCallbacks.run(thisResponse, thisResponse.validationErrors)
    }
    delete activeRequests.value[requestId]

    creating.value = false

    return request
  }

  return {
    response,
    validationErrors,
    form,
    creating,
    create,
    cancel,
    record,
    activeRequests,
    standardErrors,
    ModelClass,
    repo,
    composableId,
    onError: onErrorCallbacks.add,
    onStandardError: onStandardErrorCallbacks.add,
    onSuccess: onSuccessCallbacks.add,
    onValidationError: onValidationErrorCallbacks.add,
  }
}
