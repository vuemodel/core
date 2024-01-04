import { Response, VueModelConfig } from '@vuemodel/core'
import { orionState } from '../plugin/state'
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
    orionState.mockStandardErrors?.length ||
    Object.keys(orionState.mockValidationErrors ?? {}).length
  ) {
    if (options.notifyOnError) {
      options.config?.errorNotifiers?.[options.errorNotifierFunctionKey]?.({
        model: options.ModelClass,
        errors: {
          standardErrors: orionState.mockStandardErrors ?? [],
          validationErrors: orionState.mockValidationErrors ?? {},
        },
      })
    }

    const result = {
      success: false,
      record: undefined,
      standardErrors: orionState.mockStandardErrors ?? [],
      action: options.errorNotifierFunctionKey,
    }

    if (options.withValidationErrors) {
      return {
        ...result,
        validationErrors: (orionState.mockValidationErrors ?? {}),
      } as R
    }
    return result as R
  }

  return false
}
