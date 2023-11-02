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
import { setActivePinia } from 'pinia'

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

  // const recordsKey = `${EntityClass.entity}.records`

  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

  // const records = (await getItem<DeclassifyPiniaOrmModel<InstanceType<T>>[]>(recordsKey)) ?? {} as DeclassifyPiniaOrmModel<InstanceType<T>>[]

  const repo = useRepo(EntityClass, piniaLocalStorageState.store)
  // repo.insert(Object.values(records))

  await ensureModelRecordsInStore(repo.database)
  const query = repo.query()

  if (options?.filters) applyFilters(query, options.filters)
  if (options?.includes) applyIncludes<T>(query, options.includes)
  if (options?.sortBy) applySortBys<T>(query, options.sortBy)
  if (options?.pagination) applyPagination(query, options.pagination)

  const data = query.get() as unknown as DeclassifyPiniaOrmModel<InstanceType<T>>[]

  setActivePinia(piniaLocalStorageState.frontStore)

  const result: IndexResponse<T> = {
    records: data,
    success: true,
    standardErrors: undefined,
    validationErrors: undefined,
    action: 'index',
  }

  return result
}
