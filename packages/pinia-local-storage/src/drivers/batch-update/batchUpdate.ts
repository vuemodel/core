import { FormValidationErrors, getMergedDriverConfig, BatchUpdateOptions, BatchUpdateResponse, Form } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { DeclassifyPiniaOrmModel, PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import clone from 'just-clone'
import { deepToRaw } from '../../utils/deepToRaw'

export async function batchUpdate<T extends typeof Model> (
  ModelClass: T,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  options: BatchUpdateOptions<T> = {},
): Promise<BatchUpdateResponse<T>> {
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
        action: 'batch-update',
        success: false,
        validationErrors: {} as Record<string, FormValidationErrors<T>>,
        records: undefined,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'batch-update',
        success: false,
        validationErrors: {} as Record<string, FormValidationErrors<T>>,
        records: undefined,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

    const mockErrorResponse = makeMockErrorResponse<T, BatchUpdateResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'batchUpdate',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    const recordsKey = `${ModelClass.entity}.records`
    const records = (await getItem<Record<string, Form<InstanceType<T>>>>(recordsKey)) ?? {}

    const updatedRecords: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []

    console.log('local storage', JSON.stringify(forms))

    for (const entry of Object.entries(forms)) {
      const id = entry[0]
      const form = entry[1]

      const recordForUpdate = records?.[id]
      if (!recordForUpdate) {
        return errorReturnFunction({
          records: undefined,
          standardErrors: [{ message: `record with id ${id} not found`, name: 'Not Found' }],
          success: false,
          action: 'batch-update',
          validationErrors: {} as Record<string, FormValidationErrors<T>>,
        })
      }

      const recordClone = clone(recordForUpdate)
      const attributes = getClassAttributes(ModelClass)
      const updatedRecord = Object.assign({}, recordClone, pick(form, Object.keys(attributes))) as DeclassifyPiniaOrmModel<InstanceType<T>>

      updatedRecords.push(updatedRecord)

      records[id] = updatedRecord
    }

    await setItem(`${ModelClass.entity}.records`, deepToRaw(records))

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const result: BatchUpdateResponse<T> = {
      records: updatedRecords,
      action: 'batch-update',
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
    }

    return resolve(result)
  })
}
