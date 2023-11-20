import { Response, VueModelConfig } from '@vuemodel/core'
import { piniaLocalStorageState } from '../plugin/state'
import { Model } from 'pinia-orm'

export function makeMockErrorResponse<T extends typeof Model, R extends Response<T>> (
  options: {
    notifyOnError: boolean | undefined
    config: VueModelConfig
    ModelClass: T,
    withValidationErrors: boolean,
    errorNotifierFunctionKey: 'create' | 'update' | 'index' | 'destroy' | 'find'
  },
): R | false {
  if (
    piniaLocalStorageState.mockStandardErrors?.length ||
    Object.keys(piniaLocalStorageState.mockValidationErrors ?? {}).length
  ) {
    if (options.notifyOnError) {
      options.config?.errorNotifiers?.[options.errorNotifierFunctionKey]?.({
        model: options.ModelClass,
        errors: {
          standardErrors: piniaLocalStorageState.mockStandardErrors ?? [],
          validationErrors: piniaLocalStorageState.mockValidationErrors ?? {},
        },
      })
    }

    const result = {
      success: false,
      record: undefined,
      standardErrors: piniaLocalStorageState.mockStandardErrors ?? [],
      action: options.errorNotifierFunctionKey,
    }

    if (options.withValidationErrors) {
      return {
        ...result,
        validationErrors: (piniaLocalStorageState.mockValidationErrors ?? {}),
      } as R
    }
    return result as R
  }

  return false
}
