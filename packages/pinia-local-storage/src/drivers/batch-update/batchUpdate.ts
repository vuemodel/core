import { FormValidationErrors, getMergedDriverConfig, BatchUpdateOptions, BatchUpdateResponse, getDriverKey } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel, PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import clone from 'just-clone'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'

export async function batchUpdate<T extends typeof Model> (
  ModelClass: T,
  forms: Record<string | number, PiniaOrmForm<InstanceType<T>>>,
  options: BatchUpdateOptions<T> = {},
): Promise<BatchUpdateResponse<T>> {
  const dbPrefix = getDriverKey(options.driver) + ':'
  const dbRepo = createIndexedDbRepo(ModelClass, { prefix: dbPrefix })

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
        entity: ModelClass.entity,
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
        entity: ModelClass.entity,
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

    const updatedRecords: DeclassifyPiniaOrmModel<InstanceType<T>>[] = []

    for (const entry of Object.entries(forms)) {
      const id = entry[0]
      const form = entry[1]

      const recordForUpdate = await dbRepo.find(id)
      if (!recordForUpdate) {
        return errorReturnFunction({
          records: undefined,
          standardErrors: [{ message: `record with id ${id} not found`, name: 'Not Found' }],
          success: false,
          action: 'batch-update',
          validationErrors: {} as Record<string, FormValidationErrors<T>>,
          entity: ModelClass.entity,
        })
      }

      const recordClone = clone(recordForUpdate)
      const attributes = getClassAttributes(ModelClass)
      const attributeKeys = Object.keys(attributes)

      const updatedRecord = Object.assign({}, pick(recordClone, attributeKeys), pick(form, attributeKeys)) as DeclassifyPiniaOrmModel<InstanceType<T>>

      updatedRecords.push(updatedRecord)

      await dbRepo.update(id, pick(form, attributeKeys))
    }

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const result: BatchUpdateResponse<T> = {
      records: updatedRecords,
      action: 'batch-update',
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
      entity: ModelClass.entity,
    }

    return resolve(result)
  })
}
