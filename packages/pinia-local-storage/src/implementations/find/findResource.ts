import {
  FindResourceOptions,
  FindResponse,
  getMergedDriverConfig,
} from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { get as getItem } from 'idb-keyval'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { applyIncludes } from '../index/applyIncludes'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { ensureModelRecordsInStore } from '../../utils/ensureModelRecordsInStore'

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
    return mockErrorResponse
  }

  const repo = useRepo(EntityClass, piniaLocalStorageState.store)

  const recordsKey = `${EntityClass.entity}.records`

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

  const records = (await getItem<Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>>(recordsKey)) ?? {} as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>
  const record = records?.[id] as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

  if (!record) {
    return {
      record: undefined,
      standardErrors: [{ message: `record with id ${id} not found`, name: 'Not Found' }],
      success: false,
      action: 'find',
      validationErrors: {},
    }
  }

  repo.insert(record)
  const query = repo.query()
  if (options?.includes) {
    await ensureModelRecordsInStore(EntityClass, options.includes)
    applyIncludes(EntityClass, query, options.includes)
  }


  const recordFromStore = query.find(id) as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>

  const result: FindResponse<T> = {
    record: recordFromStore,
    standardErrors: undefined,
    success: true,
    validationErrors: undefined,
    action: 'find',
  }

  repo.flush()

  return result
}
