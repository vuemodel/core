import {
  FindResourceOptions,
  FindResponse,
  getMergedDriverConfig,
} from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { getItem } from 'localforage'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { applyIncludes } from '../index/applyIncludes'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { setActivePinia } from 'pinia'

export async function findResource<T extends typeof Model> (
  EntityClass: T,
  id: string,
  options: FindResourceOptions<T> = {},
): Promise<FindResponse<T>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.find

  const mockErrorResponse = makeMockErrorResponse<T, FindResponse<T>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: true,
    errorNotifierFunctionKey: 'find',
  })
  if (mockErrorResponse !== false) {
    setActivePinia(piniaLocalStorageState.frontStore)
    return mockErrorResponse
  }

  const recordsKey = `${EntityClass.entity}.records`

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

  const records = (await getItem<Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>>(recordsKey)) ?? {} as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>
  const record = records?.[id] as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

  if (!record) {
    setActivePinia(piniaLocalStorageState.frontStore)
    return {
      record: undefined,
      standardErrors: [{ message: `record with id ${id} not found`, name: 'Not Found' }],
      success: false,
      action: 'find',
      validationErrors: {},
    }
  }

  const repo = useRepo(EntityClass, piniaLocalStorageState.store)
  repo.insert(record)

  const query = repo.query()
  if (options?.includes) applyIncludes<T>(query, options.includes)

  const recordFromStore = query.find(id) as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>

  setActivePinia(piniaLocalStorageState.frontStore)

  const result: FindResponse<T> = {
    record: recordFromStore,
    standardErrors: undefined,
    success: true,
    validationErrors: undefined,
    action: 'find',
  }

  return result
}
