import { DeclassifyPiniaOrmModel, IndexOptions, IndexResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { indexedDbState } from '../../plugin/state'
import { applyFilters } from './applyFilters'
import { applyWiths } from './applyWiths'
import { applyOrderBys } from './applyOrderBys'
import { applyPagination } from './applyPagination'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { ensureModelRecordsInStore } from '../../utils/ensureModelRecordsInStore'

export async function index<T extends typeof Model> (
  ModelClass: T,
  options: IndexOptions<T> = {},
): Promise<IndexResponse<T>> {
  return new Promise(async (resolve, reject) => {
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
        entity: ModelClass.entity,
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
        entity: ModelClass.entity,
      })
    })

    const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.index

    const mockErrorResponse = makeMockErrorResponse<T, IndexResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'index',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    await wait(indexedDbState.mockLatencyMs ?? 0)
    const repo = useRepo(ModelClass, indexedDbState.store)

    await ensureModelRecordsInStore(
      ModelClass,
      Object.assign({}, options?.with ?? {}, options?.filters ?? {}),
      options.driver,
    )

    const query = repo.query()

    if (options?.filters) applyFilters(query, options.filters)
    const recordsCount = query.get().length
    if (options?.with) applyWiths(ModelClass, query, options.with)
    if (options?.orderBy) applyOrderBys<InstanceType<T>>(query, options.orderBy)
    if (options?.pagination) applyPagination(query, options.pagination)

    const data = query.get() as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>[]

    const recordsPerPage = options.pagination?.recordsPerPage
    const page = options.pagination?.page
    const pagesCount = recordsPerPage ? Math.ceil(recordsCount / recordsPerPage) : undefined

    if (page && pagesCount && (page > pagesCount)) {
      return errorReturnFunction({
        action: 'index',
        success: false,
        standardErrors: [{
          name: 'beyond last page',
          message: `cannot navigate beyond the last page: "${page}/${pagesCount}"`,
        }],
        validationErrors: {},
        records: undefined,
        entity: ModelClass.entity,
      })
    }

    if (typeof page === 'number' && page < 1) {
      return errorReturnFunction({
        action: 'index',
        success: false,
        standardErrors: [{ name: 'before first page', message: `cannot navigate before the first page: "${page}/${pagesCount}"` }],
        validationErrors: {},
        records: undefined,
        entity: ModelClass.entity,
      })
    }

    const result: IndexResponse<T> = {
      records: data,
      success: true,
      standardErrors: undefined,
      validationErrors: undefined,
      action: 'index',
      pagination: {
        recordsPerPage,
        page,
        recordsCount,
        pagesCount,
      },
      entity: ModelClass.entity,
    }

    repo.flush()

    return resolve(result)
  })
}
