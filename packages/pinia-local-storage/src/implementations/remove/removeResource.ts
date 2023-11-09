import { RemoveResourceOptions, RemoveResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'

export async function removeResource<T extends typeof Model> (
  EntityClass: T,
  id: string,
  options: RemoveResourceOptions = {},
): Promise<RemoveResponse<T>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.remove

  const mockErrorResponse = makeMockErrorResponse<T, RemoveResponse<T>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: false,
    errorNotifierFunctionKey: 'remove',
  })
  if (mockErrorResponse !== false) return mockErrorResponse

  if (!id) {
    return {
      standardErrors: [{
        message: 'cannot remove a record without an id',
        name: 'missing id',
      }],
      action: 'remove',
      record: undefined,
      success: false,
    }
  }

  const recordsKey = `${EntityClass.entity}.records`
  const items = (await getItem<Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>>(recordsKey)) ?? {} as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>
  const record = items?.[id] as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

  if (!record) {
    return {
      standardErrors: [{
        message: `record with id "${id}" not found`,
        name: 'not found',
      }],
      action: 'remove',
      record: undefined,
      success: false,
    }
  }

  delete items?.[id]

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)
  await setItem(recordsKey, items)

  const result: RemoveResponse<T> = {
    record,
    standardErrors: undefined,
    success: true,
    action: 'remove',
  }

  return result
}
