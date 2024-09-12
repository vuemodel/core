import { FormValidationErrors, UpdateOptions, UpdateResponse, getMergedDriverConfig, LoosePrimaryKey, getDriverKey } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'

export async function update<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: PiniaOrmForm<InstanceType<T>>,
  options: UpdateOptions<T> = {},
): Promise<UpdateResponse<T>> {
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

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id
    const originalRecord = await dbRepo.find(idResolved)

    if (!originalRecord) {
      return errorReturnFunction({
        record: undefined,
        standardErrors: [{ message: `record with id ${idResolved} not found`, name: 'Not Found' }],
        success: false,
        action: 'update',
        validationErrors: {} as FormValidationErrors<T>,
      })
    }

    await dbRepo.update(idResolved, form)
    const updatedRecord = await dbRepo.find(idResolved)

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
