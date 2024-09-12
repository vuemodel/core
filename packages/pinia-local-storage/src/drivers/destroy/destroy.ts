import { DestroyOptions, DestroyResponse, getDriverKey, getMergedDriverConfig } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import { createIndexedDbRepo } from '../../utils/createIndexedDbRepo'

// TODO: do we also need to ensure it's deleted from the "backend store"?
export async function destroy<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options: DestroyOptions<T> = {},
): Promise<DestroyResponse<T>> {
  const dbPrefix = getDriverKey(options.driver) + ':'
  const dbRepo = createIndexedDbRepo(ModelClass, { prefix: dbPrefix })

  return new Promise(async (resolve, reject) => {
    const config = getMergedDriverConfig(options?.driver)
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.destroy
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
        action: 'destroy',
        success: false,
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
        action: 'destroy',
        success: false,
        record: undefined,
        entity: ModelClass.entity,
      })
    })

    const mockErrorResponse = makeMockErrorResponse<T, DestroyResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: false,
      errorNotifierFunctionKey: 'destroy',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    if (!id) {
      return errorReturnFunction({
        standardErrors: [{
          message: 'cannot destroy a record without an id',
          name: 'missing id',
        }],
        action: 'destroy',
        record: undefined,
        success: false,
        entity: ModelClass.entity,
      })
    }

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id
    const record = (await dbRepo.find(idResolved)) as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

    if (!record) {
      return errorReturnFunction({
        standardErrors: [{
          message: `record with id "${idResolved}" not found`,
          name: 'not found',
        }],
        action: 'destroy',
        record: undefined,
        success: false,
        entity: ModelClass.entity,
      })
    }

    dbRepo.destroy(idResolved)
    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

    const result: DestroyResponse<T> = {
      record,
      standardErrors: undefined,
      success: true,
      action: 'destroy',
      entity: ModelClass.entity,
    }

    return resolve(result)
  })
}
