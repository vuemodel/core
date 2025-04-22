import { toValue } from 'vue'
import { UseBulkUpdateUpdateOptions } from '../../contracts/bulk-update/UseBulkUpdater'
import { BulkUpdateResponse, BulkUpdateErrorResponse, SyncResponse } from '../../types/Response'
import { getDriverKey } from '../../utils/getDriverKey'
import { bulkUpdate as bulkUpdateRecords } from '../../actions/bulkUpdate'
import { Model, useRepo } from 'pinia-orm'
import { generateRandomString } from '../../utils/generateRandomString'
import { getFormsChangedValues } from './getFormsChangedValues'
import clone from 'just-clone'
import { sync } from '../../actions/sync'
import { FilterPiniaOrmModelToRelationshipTypes } from 'pinia-orm-helpers'
import { getRecordPrimaryKey } from '../../utils/getRecordPrimaryKey'
import { OnBulkUpdatePersistMessage, OnSyncPersistMessage } from '../../broadcasting/BroadcastMessages'
import { BulkUpdater } from './BulkUpdater'

export async function performUpdate<
  T extends typeof Model,
  RelationshipTypes = FilterPiniaOrmModelToRelationshipTypes<InstanceType<T>>
> (
  optionsParam: UseBulkUpdateUpdateOptions<T>,
  bulkUpdater: BulkUpdater<T>,
): Promise<BulkUpdateResponse<T>> {
  type SyncRequests = Record<
    keyof RelationshipTypes,
    {
      request: (Promise<SyncResponse<T>> & { cancel(): void }),
      foreignId: string,
      relatedKey: string,
      PivotModel: Model
    }
  >
  type Request = Promise<BulkUpdateResponse<T>> & { cancel(): void }

  if (!Object.keys(bulkUpdater.changes.value).length) {
    return {
      action: 'bulk-update',
      entity: bulkUpdater.entity,
      records: [],
      success: true,
      standardErrors: undefined,
      validationErrors: undefined,
    }
  }

  const driverKey = getDriverKey(bulkUpdater.options?.driver)

  const missingPremadeFormIds: string[] = []
  if (optionsParam.forms) {
    Object.keys(optionsParam.forms).forEach(recordId => {
      if (!bulkUpdater.formsKeyed.value[recordId]) {
        missingPremadeFormIds.push(recordId)
      }
    })
  }

  if (missingPremadeFormIds.length) {
    await bulkUpdater.formMaker?.makeForms(missingPremadeFormIds)
  }

  if (optionsParam.forms) {
    Object.entries(optionsParam.forms).forEach(([formId, form]) => {
      const changedValues = getFormsChangedValues({
        skipBelongsToMany: true,
        id: formId,
        newValues: form,
        repo: bulkUpdater.repo,
        driver: driverKey,
        piniaOrmRelationships: bulkUpdater.piniaOrmRelationships,
        pivotClasses: bulkUpdater.pivotClasses,
      })

      if (!bulkUpdater.changes.value[formId]) { bulkUpdater.changes.value[formId] = {} }
      Object.assign(bulkUpdater.changes.value[formId], changedValues)
      Object.assign(bulkUpdater.formsKeyed.value[formId], form)
    })
  }

  const changesWithoutBelongsToMany = clone(bulkUpdater.changes.value)

  bulkUpdater.belongsToManyRelationshipKeys?.forEach(relationshipKey => {
    Object.keys(changesWithoutBelongsToMany).forEach((id) => {
      delete changesWithoutBelongsToMany[id][relationshipKey]
    })
  })

  bulkUpdater.response.value = undefined
  bulkUpdater.belongsToManyResponses.value = {}

  const persist = !!toValue(bulkUpdater.options?.persist)

  const controller = new AbortController()
  const signal = controller.signal

  const request = bulkUpdateRecords?.(
    bulkUpdater.ModelClass,
    changesWithoutBelongsToMany,
    {
      driver: driverKey,
      notifyOnError: !!bulkUpdater.options?.notifyOnError,
      signal,
      throw: false,
    },
  ) as Request

  const syncRequests: SyncRequests = {} as SyncRequests

  for (const entry of Object.entries(bulkUpdater.changes.value)) {
    const parentPrimaryKey = entry[0] as keyof RelationshipTypes
    const recordChanges = entry[1]

    // Relationships
    for (const relatedKey of bulkUpdater.belongsToManyRelationshipKeys ?? []) {
      const relatedChange = (recordChanges as any)[relatedKey]
      if (relatedChange) {
        const request = sync(bulkUpdater.ModelClass, parentPrimaryKey as string, relatedKey as any, relatedChange) as Promise<SyncResponse<T>> & { cancel(): void }
        request.cancel = () => {
          controller.abort()
        }
        syncRequests[parentPrimaryKey] = {
          PivotModel: ((bulkUpdater.piniaOrmRelationships as any)[relatedKey]).pivot,
          relatedKey,
          foreignId: String(parentPrimaryKey),
          request: request.then(response => {
            (bulkUpdater.belongsToManyResponses.value as any)[parentPrimaryKey] = response

            return response
          }) as any,
        }
      }
    }
  }

  const fieldNewValueMap = new Map()

  const changedRecordMetas = Object.entries(bulkUpdater.changes.value).map(changeEntry => {
    const recordMeta = bulkUpdater.meta.value[changeEntry[0]]
    recordMeta.updating = true
    recordMeta.changes = changeEntry[1]
    return recordMeta
  })

  const fields = Object.entries(bulkUpdater.changes.value).flatMap(changeEntry => {
    const id = changeEntry[0]
    const changeForm = changeEntry[1]
    bulkUpdater.meta.value[id].updating = true
    return Object.keys(changeForm).map(fieldKey => {
    /* @ts-expect-error hard to type, no benefit */
      const field = bulkUpdater.meta.value[id].fields[fieldKey]
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

  bulkUpdater.activeRequest.value = { forms: bulkUpdater.formsKeyed.value, request }
  bulkUpdater.activeRequests.value[requestId] = bulkUpdater.activeRequest.value

  bulkUpdater.updating.value = true

  const [thisResponse, ...syncResponses] = await Promise.all([
    request,
    ...(Object.values(syncRequests).map((context: any) => context.request) as SyncResponse<typeof Model>[]),
  ])

  bulkUpdater.updating.value = false

  bulkUpdater.activeRequest.value = undefined
  bulkUpdater.response.value = thisResponse

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
          entity: bulkUpdater.ModelClass.entity,
          response: syncResponse,
          related: PivotClass.entity,
        })

        bulkUpdater.syncPersistHooks.forEach(async hook => await hook({
          ModelClass: bulkUpdater.ModelClass,
          entity: bulkUpdater.entity,
          response: syncResponse,
          related: PivotClass.entity,
        }))

        bulkUpdater.syncPersistChannel.postMessage(syncPersistMessage)
        bulkUpdater.syncPersistEntityChannel.postMessage(syncPersistMessage)
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
    bulkUpdater.repo.save(thisResponse?.records ?? [])

    if (thisResponse.success) {
      const bulkUpdatePersistMessage: OnBulkUpdatePersistMessage<T> = clone({
        entity: bulkUpdater.entity,
        response: thisResponse,
      })

      bulkUpdater.bulkUpdatePersistHooks.forEach(async hook => await hook({
        ModelClass: bulkUpdater.ModelClass,
        entity: bulkUpdater.entity,
        response: thisResponse,
      }))

      bulkUpdater.bulkUpdatePersistChannel.postMessage(bulkUpdatePersistMessage)
      bulkUpdater.bulkUpdatePersistEntityChannel.postMessage(bulkUpdatePersistMessage)
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
          const relatedKey = syncRequest[0]
          if (thisResponse.validationErrors) {
            thisResponse.validationErrors[relatedKey] = syncResponse.validationErrors as any
          }
        }
      })
    }
  }

  // On Success
  if (thisResponse?.success && !hasManyToManyError) {
    changedRecordMetas.forEach(recordMeta => {
      recordMeta.failed = false
      recordMeta.changes = {}
      recordMeta.validationErrors = {}
      recordMeta.standardErrors = []
    })

    bulkUpdater.changes.value = {}
    bulkUpdater.onSuccessCallbacks.run(thisResponse)
  }

  // On validation error
  if (thisResponse.validationErrors) {
    bulkUpdater.onValidationErrorCallbacks.run(thisResponse as BulkUpdateErrorResponse<T>)
  }

  // On standard error
  if (thisResponse.standardErrors) {
    bulkUpdater.onStandardErrorCallbacks.run(thisResponse)
  }

  // On Error (any error)
  if (thisResponse.validationErrors || thisResponse.standardErrors) {
    bulkUpdater.onErrorCallbacks.run(thisResponse as BulkUpdateErrorResponse<T>)

    const rollbacksResolved = toValue(bulkUpdater.options?.rollbacks)

    // if we have rollbcks, "changes" need to be reset
    changedRecordMetas.forEach(recordMeta => {
      if (rollbacksResolved) {
        recordMeta.changes = {}
      }
      recordMeta.failed = true
    })

    Object.keys(bulkUpdater.changes.value).forEach(id => {
      bulkUpdater.meta.value[id].standardErrors = thisResponse.standardErrors
      bulkUpdater.meta.value[id].validationErrors = thisResponse.validationErrors

      const validationErrorEntries = Object.entries(thisResponse.validationErrors)
      if (validationErrorEntries.length) {
        validationErrorEntries.forEach(([field, errors]) => {
          /* @ts-expect-error validation error keys will always be in metas fields */
          bulkUpdater.meta.value[id][field] = errors
        })
      }
    })

    if (rollbacksResolved) {
      bulkUpdater.formMaker.makeForms(Object.keys(bulkUpdater.changes.value))
    }
  }

  delete bulkUpdater.activeRequests.value[requestId]

  return thisResponse
}
