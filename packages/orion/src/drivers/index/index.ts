import { IndexOptions, IndexResponse, getMergedDriverConfig, vueModelState } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { OrionDriverOptions, orionState } from '../../plugin/state'
import { applyWiths } from './applyWiths'
import { applyPagination } from './applyPagination'
import qs from 'qs'
import { applyFilters } from './applyFilters'
import { applyOrderBys } from './applyOrderBys'
import { applyScopes } from './applyScopes'
import { toValue } from 'vue'

export async function index<T extends typeof Model> (
  ModelClass: T,
  options: IndexOptions<T> = {},
): Promise<IndexResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const vueModelDefaultDriverKey = typeof vueModelState.default === 'function' ? vueModelState.default() : vueModelState.default
    const driverKey = options?.driver ?? vueModelDefaultDriverKey ?? 'default'
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
        action: 'index',
        success: false,
        validationErrors: {},
        records: undefined,
      })
    }

    options.signal?.addEventListener('abort', () => {
      return errorReturnFunction({
        standardErrors: [{
          name: 'aborted',
          message: options.signal?.reason?.message ?? options.signal?.reason ?? 'The operation was aborted.',
        }],
        action: 'index',
        success: false,
        validationErrors: {},
        records: undefined,
      })
    })

    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.index

    const postQuery = {
      includes: [],
      filters: [],
      sort: [],
    }

    const searchQuery = {}

    const orionScopes = toValue(options?._useIndexerOptions?.orionScopes)

    if (options?.filters) applyFilters(ModelClass, postQuery, options.filters)
    if (options?.with) applyWiths(ModelClass, postQuery, options.with, driverKey)
    if (options?.orderBy) applyOrderBys<InstanceType<T>>(postQuery, options.orderBy)
    if (options?.pagination) applyPagination(searchQuery, options.pagination)
    if (orionScopes) applyScopes(postQuery, orionScopes)

    const wretch = await driverOptions.createWretch()

    try {
      const response = await wretch.url(`/${ModelClass.entity}/search?${qs.stringify(searchQuery)}`)
        .post(postQuery)
        .json() as { data: DeclassifyPiniaOrmModel<InstanceType<T>>[], meta: any }

      const result: IndexResponse<T> = {
        records: response.data,
        action: 'index',
        standardErrors: undefined,
        validationErrors: undefined,
        success: true,
        pagination: {
          page: response.meta?.current_page,
          pagesCount: response.meta?.last_page,
          recordsCount: response.meta?.total,
          recordsPerPage: response.meta?.per_page,
        },
      }

      return resolve(result)
    } catch (err: any) {
      const result: IndexResponse<T> = {
        standardErrors: [],
        validationErrors: {},
        success: false,
        action: 'index',
        records: undefined,
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
