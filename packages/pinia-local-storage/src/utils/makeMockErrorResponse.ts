import { ResourceResponse, VueModelConfig } from '@vuemodel/core'
import { piniaLocalStorageState } from '../plugin/state'
import { Model } from 'pinia-orm'

export function makeMockErrorResponse<T extends typeof Model, R extends ResourceResponse<T>> (
  options: {
    notifyOnError: boolean | undefined
    config: VueModelConfig
    EntityClass: T,
    includeValidationErrors: boolean,
    errorNotifierFunctionKey: 'create' | 'update' | 'index' | 'remove' | 'find'
  },
): R | false {
  if (
    piniaLocalStorageState.mockStandardErrors?.length ||
    Object.keys(piniaLocalStorageState.mockValidationErrors ?? {}).length
  ) {
    if (options.notifyOnError) {
      options.config?.errorNotifiers?.[options.errorNotifierFunctionKey]?.({
        model: options.EntityClass,
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

    if (options.includeValidationErrors) {
      return {
        ...result,
        validationErrors: (piniaLocalStorageState.mockValidationErrors ?? {}),
      } as R
    }
    return result as R
  }

  return false
}
