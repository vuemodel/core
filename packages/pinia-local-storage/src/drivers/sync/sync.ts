import { FormValidationErrors, getMergedDriverConfig, SyncOptions, SyncResponse, Form, LoosePrimaryKey, FilterPiniaOrmModelToManyRelationshipTypes } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import clone from 'just-clone'
import { deepToRaw } from '../../utils/deepToRaw'

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
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

    const mockErrorResponse = makeMockErrorResponse<T, SyncResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'batchUpdate',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    // discover model of the pivot table
    const Relation = (new ModelClass()).$getRelation(related)
    const PivotModel = Relation.pivot

    // get records on the pivot table
    const recordsKey = `${PivotModel.$entity()}.records`
    const records = (await getItem<Record<string, Form<InstanceType<T>>>>(recordsKey)) ?? {}
    const recordEntries = Object.entries(records)

    // Remove all records with the id of this ModelClass
    const foreignPivotKey = Relation.foreignPivotKey // this model
    const relatedPivotKey = Relation.relatedPivotKey // related model
    const currentPivotEntries = recordEntries.filter(([recordId, record]) => {
      return record[foreignPivotKey] === id
    })

    const attached: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []
    const detached: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []
    const updated: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []

    // For each `currentRecord`, if it doesn't exist in the form, delete it
    currentPivotEntries.forEach(([pivotId, pivotRecord]) => {
      if (!forms[pivotRecord[relatedPivotKey]]) {
        detached.push(clone(records[pivotId]))
        delete records[pivotId]
      }
    })

    Object.entries(forms).forEach(([recordToAttachId, pivotForm]) => {
      const idsArray = PivotModel.$getKeyName().map((key) => {
        if (key === foreignPivotKey) {
          return id
        } else if (key === relatedPivotKey) {
          return recordToAttachId
        }
        return null // Fallback in case of unexpected keys (optional)
      })
      const compositeId = JSON.stringify(idsArray)

      if (!records[compositeId]) {
        const recordToAdd = {
          [foreignPivotKey]: id,
          [relatedPivotKey]: recordToAttachId,
          ...pivotForm,
        }
        attached.push(recordToAdd)
        records[compositeId] = recordToAdd
      } else {
        const recordToUpdate = { ...records[compositeId], ...pivotForm }
        updated.push(recordToUpdate)
        records[compositeId] = recordToUpdate
      }
    })

    await setItem(recordsKey, deepToRaw(records))

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const result: SyncResponse<T> = {
      success: true,
      standardErrors: undefined,
      action: 'sync',
      attached,
      detached,
      updated,
    }

    return resolve(result)
  })
}
