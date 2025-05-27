import {
  DeclassifyPiniaOrmModel,
  FindOptions,
  FindResponse,
  getMergedDriverConfig,
  vueModelState,
} from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { OrionDriverOptions, orionState } from '../../plugin/state'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import { applyWiths } from '../index/applyWiths'
import qs from 'qs'

export async function find<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  options: FindOptions<T> = {},
): Promise<FindResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const vueModelDefaultDriverKey = typeof vueModelState.default === 'function' ? vueModelState.default() : vueModelState.default
    const driverKey = options?.driver ?? vueModelDefaultDriverKey ?? 'default'
    const driverOptions = orionState[driverKey] as OrionDriverOptions
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

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id

    const query = {
      includes: [],
    }
    applyWiths(ModelClass, query, options.with ?? {}, driverKey)

    const wretch = await driverOptions.createWretch({ primaryKey: String(idResolved) })

    try {
      const response = await wretch.url(`/${ModelClass.entity}/${idResolved}?${qs.stringify(query)}`)
        .get()
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>> }

      const result: FindResponse<T> = {
        record: response.data,
        action: 'find',
        standardErrors: undefined,
        validationErrors: undefined,
        success: true,
        entity: ModelClass.entity,
      }

      return resolve(result)
    } catch (err: any) {
      const result: FindResponse<T> = {
        standardErrors: [],
        validationErrors: {},
        success: false,
        action: 'find',
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

      if (typeof err?.json?.errors === 'object') {
        result.validationErrors = err.json.errors
      }

      if (notifyOnError) {
        optionsMerged.errorNotifiers?.find?.({
          model: ModelClass,
          errors: {
            standardErrors: result.standardErrors,
            validationErrors: result.validationErrors ?? {},
          },
        })
      }

      return errorReturnFunction(result)
    }
  })
}
