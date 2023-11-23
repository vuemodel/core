import { IndexOptions, IndexResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { applyFilters } from './applyFilters'
import { applyWiths } from './applyWiths'
import { applyOrderBys } from './applyOrderBys'
import { applyPagination } from './applyPagination'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { ensureModelRecordsInStore } from '../../utils/ensureModelRecordsInStore'

function limitOffset<T> (array: T[], limit: number, offset: number): T[] {
  if (!array) return []

  const length = array.length

  if (!length) {
    return []
  }
  if (offset > length - 1) {
    return []
  }

  const start = Math.min(length - 1, offset)
  const end = Math.min(length, offset + limit)

  return array.slice(start, end)
}

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

    const mockErrorResponse = makeMockErrorResponse<T, IndexResponse<T>>({
      config,
      ModelClass,
      notifyOnError,
      withValidationErrors: true,
      errorNotifierFunctionKey: 'index',
    })
    if (mockErrorResponse !== false) return errorReturnFunction(mockErrorResponse)

    await wait(piniaLocalStorageState.mockLatencyMs ?? 0)
    const repo = useRepo(ModelClass, piniaLocalStorageState.store)

    await ensureModelRecordsInStore(ModelClass, options?.with ?? {})
    const recordsCount = repo.all().length

    const query = repo.query()

    if (options?.filters) applyFilters(query, options.filters)
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
      })
    }

    if (typeof page === 'number' && page < 1) {
      return errorReturnFunction({
        action: 'index',
        success: false,
        standardErrors: [{ name: 'before first page', message: `cannot navigate before the first page: "${page}/${pagesCount}"` }],
        validationErrors: {},
        records: undefined,
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
    }

    repo.flush()

    return resolve(result)
  })
}
