import { DestroyOptions, DestroyResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'

export async function destroy<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options: DestroyOptions<T> = {},
): Promise<DestroyResponse<T>> {
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
      })
    }

    const recordsKey = `${ModelClass.entity}.records`
    const items = (await getItem<Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>>(recordsKey)) ?? {} as Record<string, DeclassifyPiniaOrmModel<InstanceType<T>>>

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id
    const record = items?.[idResolved] as DeclassifyPiniaOrmModel<InstanceType<T>> | undefined

    if (!record) {
      return errorReturnFunction({
        standardErrors: [{
          message: `record with id "${idResolved}" not found`,
          name: 'not found',
        }],
        action: 'destroy',
        record: undefined,
        success: false,
      })
    }

    delete items?.[idResolved]

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)
    await setItem(recordsKey, items)

    const result: DestroyResponse<T> = {
      record,
      standardErrors: undefined,
      success: true,
      action: 'destroy',
    }

    return resolve(result)
  })
}
