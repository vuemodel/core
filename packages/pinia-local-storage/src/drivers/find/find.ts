import {
  FindOptions,
  FindResponse,
  getDriverKey,
  getMergedDriverConfig,
} from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { applyWiths } from '../index/applyWiths'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { ensureModelRecordsInStore } from '../../utils/ensureModelRecordsInStore'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'

export async function find<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options: FindOptions<T> = {},
): Promise<FindResponse<T>> {
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
        action: 'find',
        success: false,
        validationErrors: {},
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
        action: 'find',
        success: false,
        validationErrors: {},
        record: undefined,
        entity: ModelClass.entity,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.find

    const mockErrorResponse = makeMockErrorResponse<T, FindResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'find',
    })
    if (mockErrorResponse !== false) {
      return errorReturnFunction(mockErrorResponse)
    }

    const repo = useRepo(ModelClass, piniaLocalStorageState.store)

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id
    const record = (dbRepo.find(idResolved)) as unknown as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

    if (!record) {
      return errorReturnFunction({
        record: undefined,
        standardErrors: [{ message: `record with id ${idResolved} not found`, name: 'Not Found' }],
        success: false,
        action: 'find',
        validationErrors: {},
        entity: ModelClass.entity,
      })
    }

    repo.insert(record)
    const query = repo.query()
    if (options?.with) {
      await ensureModelRecordsInStore(ModelClass, options.with, options.driver)
      applyWiths(ModelClass, query, options.with)
    }

    const recordFromStore = query.find(idResolved) as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>

    const result: FindResponse<T> = {
      record: recordFromStore,
      standardErrors: undefined,
      success: true,
      validationErrors: undefined,
      action: 'find',
      entity: ModelClass.entity,
    }

    repo.flush()

    return resolve(result)
  })
}
