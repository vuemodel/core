import { DeclassifyPiniaOrmModel, DestroyOptions, DestroyResponse, getMergedDriverConfig, vueModelState } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { OrionDriverOptions, orionState } from '../../plugin/state'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'

export async function destroy<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options: DestroyOptions<T> = {},
): Promise<DestroyResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const vueModelDefaultDriverKey = typeof vueModelState.default === 'function' ? vueModelState.default() : vueModelState.default
    const driverOptions = orionState[options?.driver ?? vueModelDefaultDriverKey ?? 'default'] as OrionDriverOptions
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

    const wretch = await driverOptions.createWretch({ primaryKey: String(idResolved) })

    try {
      const response = await wretch.url(`/${ModelClass.entity}/${idResolved}`)
        .delete()
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>> }

      const result: DestroyResponse<T> = {
        record: response.data,
        action: 'destroy',
        standardErrors: undefined,
        success: true,
        entity: ModelClass.entity,
      }

      return resolve(result)
    } catch (err: any) {
      const result: DestroyResponse<T> = {
        standardErrors: [],
        success: false,
        action: 'destroy',
        record: undefined,
        entity: ModelClass.entity,
      }

      result.standardErrors = [
        {
          message: err?.message ?? 'unknown',
          httpStatus: err.status,
          name: err?.message ?? 'unknown',
          details: err,
        },
      ]

      if (notifyOnError) {
        optionsMerged.errorNotifiers?.destroy?.({
          model: ModelClass,
          errors: {
            standardErrors: result.standardErrors,
          },
        })
      }

      return errorReturnFunction(result)
    }
  })
}
