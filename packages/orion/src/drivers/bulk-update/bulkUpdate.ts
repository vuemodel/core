import { BulkUpdateOptions, BulkUpdateResponse, DeclassifyPiniaOrmModel, Form, UseBulkUpdateFormValidationErrors, getMergedDriverConfig, vueModelState } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { OrionDriverOptions, orionState } from '../../plugin/state'

export async function bulkUpdate<T extends typeof Model> (
  ModelClass: T,
  forms: Record<string | number, Form<InstanceType<T>>>,
  options: BulkUpdateOptions<T> = {},
): Promise<BulkUpdateResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const vueModelDefaultDriverKey = typeof vueModelState.default === 'function' ? vueModelState.default() : vueModelState.default
    const driverOptions = orionState[options?.driver ?? vueModelDefaultDriverKey ?? 'default'] as OrionDriverOptions
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
        action: 'bulk-update',
        success: false,
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        records: undefined,
        entity: ModelClass.entity,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'bulk-update',
        success: false,
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        records: undefined,
        entity: ModelClass.entity,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.bulkUpdate

    const requestData = { resources: forms }
    const wretch = await driverOptions.createWretch({ data: requestData })

    try {
      const response = await wretch.url(`/${ModelClass.entity}/batch`)
        .patch(requestData)
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>>[] }

      const result: BulkUpdateResponse<T> = {
        records: response.data,
        action: 'bulk-update',
        standardErrors: undefined,
        validationErrors: undefined,
        success: true,
        entity: ModelClass.entity,
      }

      return resolve(result)
    } catch (err: any) {
      const result: BulkUpdateResponse<T> = {
        standardErrors: [],
        validationErrors: {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
        success: false,
        action: 'bulk-update',
        records: undefined,
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
        optionsMerged.errorNotifiers?.bulkUpdate?.({
          model: ModelClass,
          errors: {
            standardErrors: result.standardErrors,
            validationErrors: result.validationErrors ?? {} as UseBulkUpdateFormValidationErrors<InstanceType<T>>,
          },
        })
      }

      return errorReturnFunction(result)
    }
  })
}
