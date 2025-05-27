import { FormValidationErrors, UpdateOptions, UpdateResponse, getMergedDriverConfig, LoosePrimaryKey, getDriverKey, Form, getClassAttributes } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { indexedDbState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'
import { pick } from '../../utils/pick'
import clone from 'just-clone'

export async function update<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: Form<InstanceType<T>>,
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
        validationErrors: {} as FormValidationErrors<InstanceType<T>>,
        record: undefined,
        entity: ModelClass.entity,
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
        validationErrors: {} as FormValidationErrors<InstanceType<T>>,
        record: undefined,
        entity: ModelClass.entity,
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
        validationErrors: {} as FormValidationErrors<InstanceType<T>>,
        entity: ModelClass.entity,
      })
    }

    const attributes = getClassAttributes(ModelClass)
    const attributeKeys = Object.keys(attributes)

    const updatedRecordId = await dbRepo.update(idResolved, pick(clone(form), attributeKeys))
    const updatedRecord = await dbRepo.find(updatedRecordId)

    await wait(indexedDbState.mockLatencyMs ?? 0)

    const result: UpdateResponse<T> = {
      record: updatedRecord,
      action: 'update',
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
      entity: ModelClass.entity,
    }

    return resolve(result)
  })
}
