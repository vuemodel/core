import { FormValidationErrors, UpdateOptions, UpdateResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import clone from 'just-clone'
import { deepToRaw } from '../../utils/deepToRaw'

export async function update<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: PiniaOrmForm<InstanceType<T>>,
  options: UpdateOptions<T> = {},
): Promise<UpdateResponse<T>> {
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
        action: 'update',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'update',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

    const mockErrorResponse = makeMockErrorResponse<T, UpdateResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'update',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    const recordsKey = `${ModelClass.entity}.records`
    const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id
    const recordForUpdate = records?.[idResolved]

    if (!recordForUpdate) {
      return errorReturnFunction({
        record: undefined,
        standardErrors: [{ message: `record with id ${idResolved} not found`, name: 'Not Found' }],
        success: false,
        action: 'update',
        validationErrors: {} as FormValidationErrors<T>,
      })
    }

    const recordClone = clone(recordForUpdate)
    const attributes = getClassAttributes(ModelClass)
    const updatedRecord = Object.assign({}, recordClone, pick(form, Object.keys(attributes)))

    records[idResolved] = updatedRecord

    await setItem(`${ModelClass.entity}.records`, deepToRaw(records))
    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const result: UpdateResponse<T> = {
      record: updatedRecord,
      action: 'update',
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
    }

    return resolve(result)
  })
}
