import { UpdateResourceOptions, UpdateResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { setItem, getItem } from 'localforage'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { setActivePinia } from 'pinia'

export async function updateResource<T extends typeof Model> (
  EntityClass: T,
  id: string,
  form: PiniaOrmForm<InstanceType<T>>,
  options: UpdateResourceOptions = {},
): Promise<UpdateResponse<InstanceType<T>>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

  const mockErrorResponse = makeMockErrorResponse<T, UpdateResponse<InstanceType<T>>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: true,
    errorNotifierFunctionKey: 'update',
  })
  if (mockErrorResponse !== false) return mockErrorResponse

  const recordsKey = `${EntityClass.entity}.records`
  const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}
  const repo = useRepo(EntityClass, piniaLocalStorageState.store)

  const recordForUpdate = records?.[id]

  if (!recordForUpdate) {
    throw new Error(`could not find record with id "${id}"`)
  }

  const recordClone = structuredClone(recordForUpdate)
  const attributes = getClassAttributes(EntityClass)
  const updatedRecord = Object.assign({}, recordClone, pick(form, Object.keys(attributes)))

  records[id] = updatedRecord

  repo.insert(updatedRecord)

  await setItem(`${EntityClass.entity}.records`, records)
  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

  setActivePinia(piniaLocalStorageState.frontStore)

  const result: UpdateResponse<InstanceType<T>> = {
    record: updatedRecord,
    standardErrors: undefined,
    validationErrors: undefined,
    success: true,
  }

  return result
}
