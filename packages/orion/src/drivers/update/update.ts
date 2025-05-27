import { DeclassifyPiniaOrmModel, Form, FormValidationErrors, UpdateOptions, UpdateResponse, getMergedDriverConfig, vueModelState } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { LoosePrimaryKey } from '@vuemodel/core/src/types/LoosePrimaryKey'
import { OrionDriverOptions, orionState } from '../../plugin/state'

export async function update<T extends typeof Model> (
  ModelClass: T,
  id: LoosePrimaryKey,
  form: Form<InstanceType<T>>,
  options: UpdateOptions<T> = {},
): Promise<UpdateResponse<T>> {
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
        action: 'update',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
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
        action: 'update',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
        entity: ModelClass.entity,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

    const idResolved = Array.isArray(id) ? JSON.stringify(id) : id

    const wretch = await driverOptions.createWretch({ data: form, primaryKey: String(idResolved) })

    try {
      const response = await wretch.url(`/${ModelClass.entity}/${idResolved}`)
        .patch(form)
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>> }

      const result: UpdateResponse<T> = {
        record: response.data,
        action: 'update',
        standardErrors: undefined,
        validationErrors: undefined,
        success: true,
        entity: ModelClass.entity,
      }

      return resolve(result)
    } catch (err: any) {
      const result: UpdateResponse<T> = {
        standardErrors: [],
        validationErrors: {} as FormValidationErrors<T>,
        success: false,
        action: 'update',
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
        optionsMerged.errorNotifiers?.update?.({
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
