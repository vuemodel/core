import { CreateResourceOptions, CreateResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { setItem, getItem } from 'localforage'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { setActivePinia } from 'pinia'
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
    setActivePinia(piniaLocalStorageState.frontStore)
    return mockErrorResponse
  }

  const recordsKey = `${EntityClass.entity}.records`
  const baseData = pick(new EntityClass(), Object.keys(getClassAttributes(EntityClass)))
  const data = Object.assign({}, baseData, form as InstanceType<T>)
  const repo = useRepo(EntityClass, piniaLocalStorageState.store)
  const primaryKey = String(EntityClass.primaryKey)

  const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}
  const existingRecord = records[data[primaryKey]]

  if (existingRecord) {
    setActivePinia(piniaLocalStorageState.frontStore)
    throw new Error(`record with id ${data[primaryKey]} already exists`)
  }

  if (!repo.all().length) {
    repo.insert(Object.values(records))
  }

  records[data[primaryKey]] = data
  repo.insert(data)

  await setItem(recordsKey, records)

  /**
   * We just inserted data into the backend store. This means the
   * version of pinia that will be utilized with `useRepo` will
   * be the backend store. Consumers of this package should
   * be using the frontend store, so we make it active.
   */
  setActivePinia(piniaLocalStorageState.frontStore)

  const result: CreateResponse<T> = {
    record: data,
    standardErrors: undefined,
    validationErrors: undefined,
    success: true,
    action: 'create',
  }

  return result
}
