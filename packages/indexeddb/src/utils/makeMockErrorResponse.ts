import { Response, VueModelConfig } from '@vuemodel/core'
import { indexedDbState } from '../plugin/state'
import { Model } from 'pinia-orm'

const errorNotifierNameMap = {
  create: 'create',
  update: 'update',
  index: 'index',
  destroy: 'destroy',
  find: 'find',
  bulkUpdate: 'bulk-update',
}

export function makeMockErrorResponse<T extends typeof Model, R extends Response<T>> (
  options: {
    notifyOnError: boolean | undefined
    config: VueModelConfig
    ModelClass: T,
    withValidationErrors: boolean,
    errorNotifierFunctionKey: 'create' | 'update' | 'index' | 'destroy' | 'find' | 'bulkUpdate'
  },
): R | false {
  if (
    indexedDbState.mockStandardErrors?.length ||
    Object.keys(indexedDbState.mockValidationErrors ?? {}).length
  ) {
    if (options.notifyOnError) {
      options.config?.errorNotifiers?.[options.errorNotifierFunctionKey]?.({
        model: options.ModelClass,
        errors: {
          standardErrors: indexedDbState.mockStandardErrors ?? [],
          /* @ts-expect-error hard to type, no benefit */
          validationErrors: indexedDbState.mockValidationErrors ?? {},
        },
      })
    }

    const result = {
      success: false,
      record: undefined,
      standardErrors: indexedDbState.mockStandardErrors ?? [],
      action: errorNotifierNameMap[options.errorNotifierFunctionKey],
    }

    if (options.withValidationErrors) {
      return {
        ...result,
        validationErrors: (indexedDbState.mockValidationErrors ?? {}),
      } as R
    }
    return result as R
  }

  return false
}
