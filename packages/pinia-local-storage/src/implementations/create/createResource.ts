import { CreateResourceOptions, CreateResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { wait } from '../../utils/wait'

export async function createResource<T extends typeof Model> (
  EntityClass: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options: CreateResourceOptions = {},
): Promise<CreateResponse<T>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.create

  if (piniaLocalStorageState.mockLatencyMs) {
    await wait(piniaLocalStorageState.mockLatencyMs)
  }

  const mockErrorResponse = makeMockErrorResponse<T, CreateResponse<T>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: true,
    errorNotifierFunctionKey: 'create',
  })

  if (mockErrorResponse !== false) {
    return mockErrorResponse
  }

  const recordsKey = `${EntityClass.entity}.records`
  const baseData = pick(new EntityClass(), Object.keys(getClassAttributes(EntityClass)))
  const data = Object.assign({}, baseData, form as InstanceType<T>)
  const primaryKey = String(EntityClass.primaryKey)

  const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}
  const existingRecord = records[data[primaryKey]]

  if (existingRecord) {
    throw new Error(`record with id ${data[primaryKey]} already exists`)
  }

  records[data[primaryKey]] = data

  await setItem(recordsKey, records)

  const result: CreateResponse<T> = {
    record: data,
    standardErrors: undefined,
    validationErrors: undefined,
    success: true,
    action: 'create',
  }

  return result
}
