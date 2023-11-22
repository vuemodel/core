import { CreateOptions, CreateResponse, FormValidationErrors, getMergedDriverConfig, getRecordPrimaryKey } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { wait } from '../../utils/wait'

export async function create<T extends typeof Model> (
  ModelClass: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options: CreateOptions<T> = {},
): Promise<CreateResponse<T>> {
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
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.create

    if (piniaLocalStorageState.mockLatencyMs) {
      await wait(piniaLocalStorageState.mockLatencyMs)
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

    const recordsKey = `${ModelClass.entity}.records`
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
      })
    }

    const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}
    const existingRecord = records[primaryKey as any]

    if (existingRecord) {
      throw new Error(`record with id ${primaryKey} already exists`)
    }

    records[primaryKey as any] = data

    await setItem(recordsKey, records)

    const result: CreateResponse<T> = {
      record: data,
      standardErrors: undefined,
      validationErrors: undefined,
      success: true,
      action: 'create',
    }

    return resolve(result)
  })
}
