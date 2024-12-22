import { toValue } from 'vue'
import { UseBulkUpdaterOptions, UseBulkUpdaterReturn, UseBulkUpdateUpdateOptions } from '../../contracts/bulk-update/UseBulkUpdater'
import { BulkUpdateResponse, BulkUpdateErrorResponse, SyncResponse } from '../../types/Response'
import { getDriverKey } from '../../utils/getDriverKey'
import { bulkUpdate as bulkUpdateRecords } from '../../actions/bulkUpdate'
import { Model, useRepo } from 'pinia-orm'
import { generateRandomString } from '../../utils/generateRandomString'
import { useFormMaker } from './useFormMaker'
import { getFormsChangedValues } from './getFormsChangedValues'
import clone from 'just-clone'
import { sync } from '../../actions/sync'
import { FilterPiniaOrmModelToRelationshipTypes, RelationshipDefinition } from 'pinia-orm-helpers'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { OnBulkUpdatePersistMessage, OnSyncPersistMessage } from '../../broadcasting/BroadcastMessages'
import { BulkUpdatePersistHookPayload, SyncPersistHookPayload } from '../../hooks/Hooks'
// (Promise<SyncResponse<T>> & { cancel(): void })

export async function performUpdate<
  T extends typeof Model,
  R extends UseBulkUpdaterReturn<T>,
  RelationshipTypes = FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>
> (
  optionsParam: UseBulkUpdateUpdateOptions<T>,
  composableOptions: {
    response: R['response']
    options: UseBulkUpdaterOptions<T> | undefined
    ModelClass: T
    changes: R['changes']
    meta: R['meta']
    activeRequest: R['activeRequest']
    activeRequests: R['activeRequests']
    updating: R['updating']
    repo: R['repo']
    forms: R['forms']
    bulkUpdatePersistHooks: ((payload: BulkUpdatePersistHookPayload) => Promise<void> | void)[]
    syncPersistHooks: ((payload: SyncPersistHookPayload) => Promise<void> | void)[]
    formMaker: ReturnType<typeof useFormMaker>
    belongsToManyRelationshipKeys: (keyof RelationshipTypes)[]
    piniaOrmRelationships: Record<string, RelationshipDefinition>
    pivotClasses: Record<string, Model>
    belongsToManyResponses: R['belongsToManyResponses']
    bulkUpdatePersistChannel: BroadcastChannel,
    bulkUpdatePersistEntityChannel: BroadcastChannel,
    syncPersistChannel: BroadcastChannel,
    syncPersistEntityChannel: BroadcastChannel,
  },
): Promise<BulkUpdateResponse<T>> {
  type SyncRequests = Record<
    keyof RelationshipTypes,
    {
      request: (Promise<SyncResponse<T>> & { cancel(): void }),
      PivotModel: Model
    }
  >
  type Request = Promise<BulkUpdateResponse<T>> & { cancel(): void }

  const {
    response,
    options,
    ModelClass,
    changes,
    meta,
    activeRequest,
    activeRequests,
    updating,
    forms,
    repo,
    formMaker,
    belongsToManyRelationshipKeys,
    belongsToManyResponses,
    piniaOrmRelationships,
    pivotClasses,
    bulkUpdatePersistChannel,
    bulkUpdatePersistEntityChannel,
    bulkUpdatePersistHooks,
    syncPersistHooks,
    syncPersistChannel,
    syncPersistEntityChannel,
  } = composableOptions

  const driverKey = getDriverKey(options?.driver)

  const missingPremadeFormIds: string[] = []
  if (optionsParam.forms) {
    Object.keys(optionsParam.forms).forEach(recordId => {
      if (!forms.value[recordId]) {
        missingPremadeFormIds.push(recordId)
      }
    })
  }

  if (missingPremadeFormIds.length) {
    await formMaker.makeForms(missingPremadeFormIds)
  }

  if (optionsParam.forms) {
    Object.entries(optionsParam.forms).forEach(([formId, form]) => {
      const changedValues = getFormsChangedValues({
        id: formId,
        newValues: form,
        repo,
        driver: driverKey,
        piniaOrmRelationships,
        pivotClasses,
      })

      if (!changes.value[formId]) { changes.value[formId] = {} }
      Object.assign(changes.value[formId], changedValues)
      Object.assign(forms.value[formId], form)
    })
  }

  response.value = undefined
  belongsToManyResponses.value = {}

  const persist = !!toValue(options?.persist)

  const controller = new AbortController()
  const signal = controller.signal

  const request = bulkUpdateRecords?.(
    ModelClass,
    clone(changes.value),
    {
      driver: driverKey,
      notifyOnError: !!options?.notifyOnError,
      signal,
      throw: false,
    },
  ) as Request

  const syncRequests: SyncRequests = {} as SyncRequests

  for (const entry of Object.entries(changes.value)) {
    const parentPrimaryKey = entry[0] as keyof RelationshipTypes
    const recordChanges = entry[1]
    for (const relatedKey of belongsToManyRelationshipKeys) {
      const relatedChange = (recordChanges as any)[relatedKey]
      if (relatedChange) {
        const request = sync(ModelClass, parentPrimaryKey as string, relatedKey as any, relatedChange) as Promise<SyncResponse<T>> & { cancel(): void }
        request.cancel = () => {
          controller.abort()
        }
        syncRequests[parentPrimaryKey] = {
          PivotModel: piniaOrmRelationships[relatedKey].pivot,
          relatedKey,
          request: request.then(response => {
            (belongsToManyResponses.value as any)[parentPrimaryKey] = response

            return response
          }) as any,
        }
        // await syncRequests[parentPrimaryKey]
      }
    }
  }

  const fieldNewValueMap = new Map()

  const changedRecordMetas = Object.entries(changes.value).map(changeEntry => {
    const recordMeta = meta.value[changeEntry[0]]
    recordMeta.updating = true
    return recordMeta
  })

  const fields = Object.entries(changes.value).flatMap(changeEntry => {
    const id = changeEntry[0]
    const changeForm = changeEntry[1]
    meta.value[id].updating = true
    return Object.keys(changeForm).map(fieldKey => {
    /* @ts-expect-error hard to type, no benefit */
      const field = meta.value[id].fields[fieldKey]
      field.updating = true
      /* @ts-expect-error hard to type, no benefit */
      fieldNewValueMap.set(field, changeForm[fieldKey])
      return field
    })
  })

  request.cancel = () => {
    controller.abort()
  }

  const requestId = generateRandomString(5)

  activeRequest.value = { forms: forms.value, request }
  activeRequests.value[requestId] = activeRequest.value

  updating.value = true

  const [thisResponse, ...syncResponses] = await Promise.all([
    request,
    ...(Object.values(syncRequests).map((context: any) => context.request) as SyncResponse<typeof Model>[]),
  ])

  updating.value = false

  activeRequest.value = undefined
  response.value = thisResponse

  fields.forEach(field => {
    field.updating = false
    field.changed = false
    field.initialValue = fieldNewValueMap.get(field)
  })
  changedRecordMetas.forEach(recordMeta => {
    recordMeta.updating = false
    recordMeta.changed = false
  })

  const syncRequestEntries = Object.entries(syncRequests)

  let hasManyToManyValidationErrors = false
  let hasManyToManyStandardErrors = false
  let hasManyToManyError = false

  syncResponses.forEach((syncResponse, index) => {
    /** @ts-expect-error PivotModel doesn't exist for some reason */
    const PivotClass = syncRequestEntries[index][1].PivotModel.constructor
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

      if (Object.values(syncResponse.validationErrors).length) {
        hasManyToManyValidationErrors = true
      }

      if (syncResponse.standardErrors.length) {
        hasManyToManyStandardErrors = true
      }
    }
  })

  // Persisting to the store
  if (persist && thisResponse.success) {
    repo.save(thisResponse?.records ?? [])

    if (thisResponse.success) {
      const bulkUpdatePersistMessage: OnBulkUpdatePersistMessage<T> = clone({
        entity: ModelClass.entity,
        response: thisResponse,
      })

      bulkUpdatePersistHooks.forEach(async hook => await hook({
        ModelClass,
        entity: ModelClass.entity,
        response: thisResponse,
      }))

      bulkUpdatePersistChannel.postMessage(bulkUpdatePersistMessage)
      bulkUpdatePersistEntityChannel.postMessage(bulkUpdatePersistMessage)
    }
  }

  // Merging has many errors into the response
  if (hasManyToManyError) {
    thisResponse.success = false
    if (hasManyToManyStandardErrors) {
      if (!thisResponse.standardErrors) {
        thisResponse.standardErrors = []
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
          // const PivotClass = syncRequest[1].PivotModel
          const relatedKey = syncRequest[0]
          thisResponse.validationErrors[relatedKey] = syncResponse.validationErrors
        }
      })
    }
  }

  // On Success
  if (thisResponse?.success && !hasManyToManyError) {
    changes.value = {}
    options?.onSuccess?.(thisResponse)
  }

  // On validation error
  if (thisResponse.validationErrors) {
    options?.onValidationError?.(thisResponse as BulkUpdateErrorResponse<T>)
  }

  // On standard error
  if (thisResponse.standardErrors) {
    options?.onStandardError?.(thisResponse)
  }

  // On Error
  if (thisResponse.validationErrors || thisResponse.standardErrors) {
    options?.onError?.(thisResponse as BulkUpdateErrorResponse<T>)
  }
  delete activeRequests.value[requestId]

  return thisResponse
}
