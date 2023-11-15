import { IndexResourcesOptions, IndexResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { piniaLocalStorageState } from '../../plugin/state'
import { applyFilters } from './applyFilters'
import { applyIncludes } from './applyIncludes'
import { applySortBys } from './applySortBys'
import { applyPagination } from './applyPagination'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'
import { ensureModelRecordsInStore } from '../../utils/ensureModelRecordsInStore'

export async function indexResources<T extends typeof Model> (
  EntityClass: T,
  options: IndexResourcesOptions<T> = {},
): Promise<IndexResponse<T>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.index

  const mockErrorResponse = makeMockErrorResponse<T, IndexResponse<T>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: true,
    errorNotifierFunctionKey: 'index',
  })
  if (mockErrorResponse !== false) return mockErrorResponse

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)
  const repo = useRepo(EntityClass, piniaLocalStorageState.store)

  await ensureModelRecordsInStore(EntityClass, options?.includes ?? {})
  const recordsCount = repo.all().length

  const query = repo.query()

  if (options?.filters) applyFilters(query, options.filters)
  if (options?.includes) applyIncludes(EntityClass, query, options.includes)
  if (options?.sortBy) applySortBys<T>(query, options.sortBy)
  if (options?.pagination) applyPagination(query, options.pagination)

  const data = query.get() as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>[]

  const recordsPerPage = options.pagination?.recordsPerPage
  const currentPage = options.pagination?.page
  const pagesCount = recordsPerPage ? Math.ceil(recordsCount / recordsPerPage) : undefined

  if (currentPage && pagesCount && (currentPage > pagesCount)) {
    return {
      action: 'index',
      success: false,
      standardErrors: [{ name: 'beyond last page', message: `cannot navigate beyond the last page: "${currentPage}/${pagesCount}"` }],
      validationErrors: {},
      records: undefined,
      pagination: undefined,
    }
  }

  if (typeof currentPage === 'number' && currentPage < 1) {
    return {
      action: 'index',
      success: false,
      standardErrors: [{ name: 'before first page', message: `cannot navigate before the first page: "${currentPage}/${pagesCount}"` }],
      validationErrors: {},
      records: undefined,
      pagination: undefined,
    }
  }

  const result: IndexResponse<T> = {
    records: data,
    success: true,
    standardErrors: undefined,
    validationErrors: undefined,
    action: 'index',
    pagination: {
      recordsPerPage,
      currentPage,
      recordsCount,
      pagesCount,
    },
  }

  repo.flush()

  return result
}
