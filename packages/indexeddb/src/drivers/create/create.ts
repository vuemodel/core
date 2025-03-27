import { CreateOptions, CreateResponse, FormValidationErrors, getMergedDriverConfig, getRecordPrimaryKey, getDriverKey } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { indexedDbState } from '../../plugin/state'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { wait } from '../../utils/wait'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'

export async function create<T extends typeof Model> (
  ModelClass: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options: CreateOptions<T> = {},
): Promise<CreateResponse<T>> {
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
        action: 'create',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
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
        action: 'create',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
        entity: ModelClass.entity,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.create

    if (indexedDbState.mockLatencyMs) {
      await wait(indexedDbState.mockLatencyMs)
    }

    const mockErrorResponse = makeMockErrorResponse<T, CreateResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'create',
    })

    if (mockErrorResponse !== false) {
      return errorReturnFunction(mockErrorResponse)
    }

    const baseData = pick(new ModelClass(), Object.keys(getClassAttributes(ModelClass)))
    const data = Object.assign({}, baseData, form as InstanceType<T>)
    const primaryKey = getRecordPrimaryKey(ModelClass, data)

    if (!primaryKey) {
      return errorReturnFunction({
        action: 'create',
        record: undefined,
        standardErrors: [{ name: 'primary key unknown', message: 'could not discover the records primary key' }],
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        entity: ModelClass.entity,
      })
    }

    const existingRecord = (await dbRepo.find(primaryKey))

    if (existingRecord) {
      throw new Error(`record with id ${primaryKey} already exists`)
    }

    await dbRepo.create(data)

    const result: CreateResponse<T> = {
      record: data,
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
      action: 'create',
      entity: ModelClass.entity,
    }

    return resolve(result)
  })
}
