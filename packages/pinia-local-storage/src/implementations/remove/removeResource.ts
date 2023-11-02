import { RemoveResourceOptions, RemoveResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { getItem, setItem } from 'localforage'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { setActivePinia } from 'pinia'

export async function removeResource<T extends typeof Model> (
  EntityClass: T,
  id: string,
  options: RemoveResourceOptions = {},
): Promise<RemoveResponse<InstanceType<T>>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.remove

  const mockErrorResponse = makeMockErrorResponse<T, RemoveResponse<InstanceType<T>>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: false,
    errorNotifierFunctionKey: 'remove',
  })
  if (mockErrorResponse !== false) return mockErrorResponse

  const recordsKey = `${EntityClass.entity}.records`
  const items = (await getItem<Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>>(recordsKey)) ?? {} as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>
  const record = items?.[id] as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined
  const repo = useRepo(EntityClass, piniaLocalStorageState.store)

  if (!record) {
    throw new Error(`record with id ${id} not found`)
  }

  delete items?.[id]

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)
  await setItem(recordsKey, items)
  repo.destroy(id)

  setActivePinia(piniaLocalStorageState.frontStore)

  const result: RemoveResponse<InstanceType<T>> = {
    record,
    standardErrors: undefined,
    success: true,
  }

  return result
}
