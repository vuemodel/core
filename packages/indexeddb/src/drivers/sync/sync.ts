import { FormValidationErrors, getMergedDriverConfig, SyncOptions, SyncResponse, LoosePrimaryKey, FilterPiniaOrmModelToManyRelationshipTypes, getDriverKey, getRecordPrimaryKey } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { indexedDbState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import clone from 'just-clone'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'
import { keyBy } from '../../utils/keyBy'

export async function sync<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  related: keyof FilterPiniaOrmModelToManyRelationshipTypes<InstanceType<T>>,
  forms: string[] | number[] | Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>,
  options: SyncOptions<T> = {},
): Promise<SyncResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const config = getMergedDriverConfig(options?.driver)
    const optionsMerged = Object.assign(
      {},
      config,
      options,
    )

    // discover model of the pivot table
    const Relation = (new ModelClass()).$getRelation(related)
    const PivotModel = Relation.pivot
    const PivotConstructor = PivotModel.constructor

    const errorReturnFunction = optionsMerged.throw ? reject : resolve

    if (options.signal?.aborted) {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal.reason?.message ?? options.signal.reason ?? 'The operation was aborted.',
        }],
        action: 'sync',
        success: false,
        validationErrors: {} as Record<string, FormValidationErrors<T>>,
        attached: undefined,
        detached: undefined,
        updated: undefined,
        entity: PivotConstructor.entity,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'sync',
        success: false,
        validationErrors: {} as Record<string, FormValidationErrors<T>>,
        attached: undefined,
        detached: undefined,
        updated: undefined,
        entity: PivotConstructor.entity,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

    const mockErrorResponse = makeMockErrorResponse<T, SyncResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'bulkUpdate',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    const dbPrefix = getDriverKey(options.driver) + ':'
    const dbRepo = createIndexedDbRepo(PivotConstructor, { prefix: dbPrefix })

    // get records on the pivot table
    const records = keyBy(await dbRepo.index(), record => {
      return getRecordPrimaryKey(PivotConstructor, record)
    })
    const recordEntries = Object.entries(records)

    // Remove all records with the id of this ModelClass
    const foreignPivotKey = Relation.foreignPivotKey // this model
    const relatedPivotKey = Relation.relatedPivotKey // related model
    const currentPivotEntries = recordEntries.filter((entry) => {
      return entry[1][foreignPivotKey] === id
    })

    const attached: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []
    const detached: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []
    const updated: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []

    // For each `currentRecord`, if it doesn't exist in the form, delete it
    currentPivotEntries.forEach(([pivotId, pivotRecord]) => {
      if (!forms[pivotRecord[relatedPivotKey]]) {
        detached.push(clone(records[pivotId]))
        dbRepo.destroy(JSON.parse(pivotId))
      }
    })

    Object.entries(forms).forEach(([recordToAttachId, pivotForm]) => {
      const idsArray = PivotModel.$getKeyName().map((key) => {
        if (key === foreignPivotKey) {
          return id
        } else if (key === relatedPivotKey) {
          return recordToAttachId
        }
        return null // Fallback in case of unexpected keys
      })
      const compositeId = JSON.stringify(idsArray)

      if (!records[compositeId]) {
        const recordToAdd = {
          [foreignPivotKey]: id,
          [relatedPivotKey]: recordToAttachId,
          ...pivotForm,
        }
        attached.push(recordToAdd)
        dbRepo.create(recordToAdd)
      } else {
        const recordToUpdate = { ...records[compositeId], ...pivotForm }
        updated.push(recordToUpdate)
        dbRepo.update(JSON.parse(compositeId), recordToUpdate)
      }
    })

    await wait(indexedDbState.mockLatencyMs ?? 0)

    const result: SyncResponse<T> = {
      success: true,
      standardErrors: undefined,
      action: 'sync',
      attached,
      detached,
      updated,
      entity: PivotConstructor.entity,
    }

    return resolve(result)
  })
}
