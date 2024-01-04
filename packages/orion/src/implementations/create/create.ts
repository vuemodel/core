import { CreateOptions, CreateResponse, FormValidationErrors, getMergedDriverConfig, vueModelState } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { OrionDriverOptions, orionState } from '../../plugin/state'

export async function create<T extends typeof Model> (
  ModelClass: T,
  form: PiniaOrmForm<InstanceType<T>>,
  options: CreateOptions<T> = {},
): Promise<CreateResponse<T>> {
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
        action: 'create',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'create',
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        record: undefined,
      })
    })
    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.create

    const data = Object.assign({}, form as InstanceType<T>)
    const primaryKey = ModelClass.primaryKey

    if (!primaryKey) {
      return errorReturnFunction({
        action: 'create',
        record: undefined,
        standardErrors: [{ name: 'primary key unknown', message: 'could not discover the records primary key' }],
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
      })
    }

    const wretch = driverOptions.createWretch({ data, primaryKey })

    try {
      const response = await wretch.url('/' + ModelClass.entity)
        .post(data)
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>> }

      const result: CreateResponse<T> = {
        record: response.data,
        standardErrors: undefined,
        validationErrors: undefined,
        success: true,
        action: 'create',
      }

      return resolve(result)
    } catch (err: any) {
      const result: CreateResponse<T> = {
        standardErrors: [],
        validationErrors: {} as FormValidationErrors<T>,
        success: false,
        action: 'create',
        record: undefined,
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
        optionsMerged.errorNotifiers?.create?.({
          model: ModelClass,
          errors: {
            standardErrors: result.standardErrors,
            validationErrors: result.validationErrors,
          },
        })
      }

      return errorReturnFunction(result)
    }
  })
}
