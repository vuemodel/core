import { Model, useRepo } from 'pinia-orm'
import { Ref, computed, nextTick, ref, toValue, watch } from 'vue'
import { UseIndexerOptions, UseIndexerReturn } from '../contracts/crud/index/UseIndexer'
import { IndexResponse, IndexSuccessResponse, IndexErrorResponse } from '../types/Response'
import { getDriverKey } from '../utils/getDriverKey'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { applyWiths } from '../utils/applyWiths'
import { applyFilters } from '../utils/applyFilters'
import { applyOrderBys } from '../utils/applyOrderBys'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { PaginationDetails } from '../contracts/crud/index/PaginationDetails'
import { hasProperty } from '../utils/hasProperty'
import { resolveScopes } from './resolveScopes'
import { vueModelState } from '../plugin/state'
import { deepmerge } from 'deepmerge-ts'
import { makeWithQuery } from '../utils/makeWithQuery'
import { IndexIdsParam, IndexOptionsParam } from '../types/UseIndexerParams'
import { resolveIndexParams } from './resolveIndexParams'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { IndexWithsLoose } from '../contracts/crud/index/IndexWithsLoose'
import { IndexFilters, OnIndexPersistMessage } from '..'
import { getFirstDefined } from '../utils/getFirstDefined'
import { index as indexResource } from '../actions/index'
import { generateRandomString } from '../utils/generateRandomString'
import clone from 'just-clone'
import { removeFunctions } from '../utils/removeFunctions'
import { useCallbacks } from '../utils/useCallbacks'
import { watchPausable } from '../utils/watchPausable'

const defaultOptions = {
  persist: true,
  persistBy: 'save',
}

export function useIndexerDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseIndexerOptions<T>,
): UseIndexerReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  const indexPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.indexPersist`)
  const indexPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.indexPersist`)

  const onSuccessCallbacks = useCallbacks<[IndexSuccessResponse<T>]>([options.onSuccess])
  const onErrorCallbacks = useCallbacks<[IndexErrorResponse<T>, QueryValidationErrors]>([options.onError])
  const onStandardErrorCallbacks = useCallbacks<[IndexErrorResponse<T>]>([options.onStandardError])
  const onValidationErrorCallbacks = useCallbacks<[IndexResponse<T>]>([options.onValidationError])
  const onPaginateImmediateCallbacks = useCallbacks<[IndexResponse<T>]>([options.onPaginateImmediate])

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const indexPersistHooks = deepmerge(driverConfig.hooks?.indexPersist ?? [])

  const pagination: Ref<PaginationDetails> = ref(options.pagination ?? {} as PaginationDetails)
  const {
    pause: pauseImmediatePaginationWatcher,
    resume: resumeImmediatePaginationWatcher,
  } = watchPausable(
    [
      () => pagination.value.page,
      () => pagination.value.recordsPerPage,
    ],
    async (newValues, oldValues) => {
      const [newCurrentPage, newRecordsPerPage] = newValues
      const [oldCurrentPage, oldRecordsPerPage] = oldValues
      if (
        toValue(options?.paginateImmediate) &&
        ((newCurrentPage !== oldCurrentPage) || (newRecordsPerPage !== oldRecordsPerPage)) &&
        (newCurrentPage && newRecordsPerPage)
      ) {
        index().then(response => onPaginateImmediateCallbacks.run(response))
      }
    })

  watch(() => toValue(options?.whereIdIn),
    (newIds) => {
      if (toValue(options?.whereIdInImmediate) && Array.isArray(newIds)) {
        index()
      }
    })

  const response = ref<IndexResponse<T>>()
  const activeRequest = ref<Promise<IndexResponse<T>> & { cancel(): void }>()

  function cancel () {
    activeRequest.value?.cancel()
  }

  const indexing = ref(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as QueryValidationErrors
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const responseIds = computed<string[]>(() => {
    const ids: string[] = []
    response.value?.records?.forEach(record => {
      const id = getRecordPrimaryKey(ModelClass, record)
      if (id) ids.push(id)
    })

    return ids
  })

  function makeQuery (makeQueryOptions?: {
    omitWhereIdFilter?: boolean
    omitWith?: boolean
    omitFilters?: boolean
    omitOrderBy?: boolean
  }) {
    const query = repo.query()

    const withObject = makeQueryOptions?.omitWith
      ? {}
      : makeWithQuery(toValue(options?.with ?? {})) as IndexWiths<InstanceType<T>>

    const filtersObject = makeQueryOptions?.omitFilters
      ? {}
      : toValue(options?.filters ?? {})

    const orderByArray = makeQueryOptions?.omitFilters
      ? []
      : toValue(options?.orderBy ?? [])

    if (!makeQueryOptions?.omitWhereIdFilter) {
      query.whereId(toValue(responseIds) ?? [])
    }

    applyWiths(
      ModelClass,
      query,
      withObject,
      {
        withoutEntityGlobalScopes: options?.withoutEntityGlobalScopes,
        withoutGlobalScopes: options?.withoutGlobalScopes,
      },
    )
    applyFilters(query, filtersObject)
    applyOrderBys(query, orderByArray)

    return query
  }

  const records = computed(() => {
    const responseRecords = response.value?.records
    if (!responseRecords) return []

    return makeQuery().get()
  })

  const index: UseIndexerReturn<T>['index'] = async function index (
    optionsOrId?: IndexIdsParam | IndexOptionsParam<T>,
    optionsParam?: IndexOptionsParam<T>,
  ) {
    if (activeRequest.value) {
      activeRequest.value.cancel()
    }
    const resolvedParams = resolveIndexParams(optionsOrId, optionsParam)

    pauseImmediatePaginationWatcher()
    response.value = undefined

    const resolvedScopes = resolveScopes(
      ModelClass,
      options?.driver ?? vueModelState.default ?? 'default',
      ModelClass.entity,
      options?.scopes,
      {
        withoutEntityGlobalScopes: toValue(options?.withoutEntityGlobalScopes),
        withoutGlobalScopes: toValue(options?.withoutGlobalScopes),
      },
    )

    const withQuery = makeWithQuery(toValue(options?.with) as IndexWithsLoose)
    const filters = deepmerge(
      resolvedParams.options?.filters ?? {},
      toValue(options?.filters) ?? {},
      resolvedScopes.filters ?? {},
    ) as IndexFilters<InstanceType<T>>

    const resolvedIds = resolvedParams.ids ?? toValue(options?.whereIdIn)

    if (Array.isArray(resolvedIds)) {
      if (resolvedIds[0]) {
        const entityClassPrimaryKey = ModelClass.primaryKey
        if (Array.isArray(entityClassPrimaryKey)) {
          if (!Array.isArray(filters.or)) {
            filters.or = []
          }
          resolvedIds.forEach(id => {
            const idFilters: any = { and: [] }
            entityClassPrimaryKey.forEach((key, index) => {
              const idFilter: any = { }
              idFilter[key] = { equals: String((id as (string | number)[])[index]) }
              idFilters.and.push(idFilter)
            })
            if (filters.or) filters.or.push(idFilters)
          })
        } else {
          const entityPrimaryKey = String(ModelClass.primaryKey) as keyof typeof filters
          if (!filters[entityPrimaryKey]) {
            filters[entityPrimaryKey] = {} as any
          }
          (filters[entityPrimaryKey] as any).in = resolvedIds.map(id => String(id))
        }
      } else {
        if (!filters[String(ModelClass.primaryKey) as keyof typeof filters] as any) {
          filters[String(ModelClass.primaryKey) as keyof typeof filters] = {} as any
        }
        (filters[String(ModelClass.primaryKey) as keyof typeof filters] as any).in = []
      }
    }

    const withMerged = deepmerge(
      withQuery,
      resolvedScopes.with ?? {},
    ) as IndexWiths<InstanceType<T>>
    const orderBy = [
      ...(toValue(options?.orderBy) ?? []),
      ...(resolvedScopes.orderBy ?? []),
      ...(resolvedParams.options.orderBy ?? []),
    ]

    const paginationMerged = {
      ...(driverConfig.pagination ?? {}),
      ...(toValue(pagination.value) ?? {}),
    }

    if (hasProperty(resolvedParams.options, 'page')) paginationMerged.page = resolvedParams.options.page
    if (hasProperty(resolvedParams.options, 'recordsPerPage')) paginationMerged.recordsPerPage = resolvedParams.options.recordsPerPage
    if (typeof paginationMerged.page !== 'number') {
      paginationMerged.page = 1
      pagination.value.page = 1
    }

    const notifyOnError = toValue(options?.notifyOnError)

    const controller = new AbortController()
    const signal = controller.signal

    const useIndexerOptions = { ...options, ...resolvedParams.options, composableId }

    indexing.value = true

    const requestPagination = {
      recordsPerPage: paginationMerged?.recordsPerPage,
      page: paginationMerged?.page,
    }

    const thisRequest = indexResource(
      ModelClass,
      {
        driver: driverKey,
        filters,
        with: withMerged,
        orderBy,
        notifyOnError,
        pagination: requestPagination,
        signal,
        throw: false,
        _useIndexerOptions: useIndexerOptions,
      },
    )

    activeRequest.value = {
      ...thisRequest,
      cancel: () => {
        controller.abort()
      },
    }

    nextTick(() => resumeImmediatePaginationWatcher())

    response.value = await thisRequest
    activeRequest.value = undefined

    if (response.value.success && response.value.pagination) {
      pauseImmediatePaginationWatcher()
      pagination.value = response.value.pagination
      resumeImmediatePaginationWatcher()
    }

    const persist = !!toValue(options?.persist)
    const persistBy = toValue(options?.persistBy ?? 'save')

    // Persisting to the store
    if (persist && response.value?.records?.length) {
      if (persistBy === 'replace-save') {
        repo.flush()
        repo.save(response.value?.records)
      } else if (persistBy === 'replace-insert') {
        repo.flush()
        repo.insert(response.value?.records)
      } else {
        repo[persistBy](response.value?.records)
      }
    }

    // On Success
    if (response.value?.success) {
      const responseResolved = toValue(response)
      if (responseResolved) {
        onSuccessCallbacks.run(responseResolved as IndexSuccessResponse<T>)
      }

      const useIndexerOptionsWithoutFunction = useIndexerOptions ? removeFunctions(useIndexerOptions) : {}

      if (responseResolved?.success) {
        const indexPersistMessage: OnIndexPersistMessage<T> = clone({
          entity: ModelClass.entity,
          response: responseResolved,
          filters,
          with: withMerged,
          orderBy,
          pagination: responseResolved.pagination,
          _useIndexerOptions: useIndexerOptionsWithoutFunction,
        }) as any

        indexPersistHooks.forEach(async hook => await hook({
          ModelClass,
          entity: ModelClass.entity,
          response: responseResolved,
          filters,
          with: withMerged,
          orderBy,
          pagination: responseResolved.pagination,
          _useIndexerOptions: useIndexerOptionsWithoutFunction,
        }))

        indexPersistChannel.postMessage(indexPersistMessage)
        indexPersistEntityChannel.postMessage(indexPersistMessage)
      }
    }

    // On validation error
    if (response.value.validationErrors) {
      onValidationErrorCallbacks.run(response.value)
    }

    // On standard error
    if (response.value.standardErrors) {
      onStandardErrorCallbacks.run(response.value)
    }

    // On any error
    if (response.value.validationErrors || response.value.standardErrors) {
      onErrorCallbacks.run(response.value, response.value.validationErrors)
    }

    indexing.value = false
    nextTick(() => resumeImmediatePaginationWatcher())

    return response.value
  }

  async function next (): Promise<IndexResponse<T>> {
    const { page, pagesCount, recordsPerPage } = toValue(pagination)
    if (!recordsPerPage) {
      const errorMessage = "Cannot paginate to next records. 'recordsPerPage' must be set."
      standardErrors.value.push({
        name: 'recordsPerPage not set',
        message: errorMessage,
      })
      return {
        action: 'index',
        entity: ModelClass.entity,
        records: undefined,
        standardErrors: standardErrors.value,
        success: false,
        validationErrors: {},
      }
    }

    if (page && pagesCount && (page === pagesCount)) {
      const errorMessage = `cannot navigate beyond the last page: "${page}/${pagesCount}"`
      standardErrors.value.push({
        name: 'beyond last page',
        message: errorMessage,
      })
      return {
        action: 'index',
        entity: ModelClass.entity,
        records: undefined,
        standardErrors: standardErrors.value,
        success: false,
        validationErrors: {},
      }
    }
    pauseImmediatePaginationWatcher()
    pagination.value.page = page ? (page + 1) : 1
    resumeImmediatePaginationWatcher()

    return index()
  }

  async function previous () {
    const { recordsPerPage, page, pagesCount } = toValue(pagination)
    if (!recordsPerPage) {
      throw new Error("Cannot paginate to previous records. 'recordsPerPage' must be set.")
    }

    if (typeof page === 'number' && page === 1) {
      const errorMessage = `cannot navigate before the first page: "${page}/${pagesCount}"`
      standardErrors.value.push({
        name: 'before first page',
        message: errorMessage,
      })
      throw new Error(errorMessage)
    }

    pauseImmediatePaginationWatcher()
    pagination.value.page = page ? (page - 1) : 1
    resumeImmediatePaginationWatcher()
    return index()
  }

  async function toPage (pageNumber: number) {
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.recordsPerPage) {
      throw new Error(`Cannot paginate to page '${pageNumber}'. 'recordsPerPage' must be set.`)
    }
    pauseImmediatePaginationWatcher()
    pagination.value.page = pageNumber
    resumeImmediatePaginationWatcher()

    return index()
  }

  async function toLastPage () {
    if (!pagination.value.recordsPerPage) {
      throw new Error("Cannot paginate to last page. 'recordsPerPage' must be set.")
    }
    // If we don't have the pageCount, perform a request
    // so that we have it.
    if (!toValue(pagination).pagesCount) {
      const tempResponse = await indexResource(ModelClass, {
        pagination: { recordsPerPage: pagination.value.recordsPerPage },
      })
      if (tempResponse.success) {
        pagination.value.pagesCount = tempResponse.pagination?.pagesCount
      }
    }
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.pagesCount) {
      throw new Error('Cannot discover last page. Ensure "index()" has been called at least once.')
    }
    return toPage(paginationResolved.pagesCount)
  }

  async function toFirstPage () {
    return toPage(1)
  }

  if (getFirstDefined([options.immediate, driverConfig.immediate])) {
    index()
  }

  const isLastPage = computed(() => {
    if (!pagination.value.pagesCount || !pagination.value.page) return
    return pagination.value.page >= pagination.value.pagesCount
  })

  const isFirstPage = computed(() => {
    if (!pagination.value.pagesCount || !pagination.value.page) return
    return pagination.value.page === 1
  })

  return {
    response,
    validationErrors,
    records,
    indexing,
    index,
    next,
    previous,
    toPage,
    toFirstPage,
    toLastPage,
    standardErrors,
    makeQuery,
    pagination,
    isLastPage,
    isFirstPage,
    cancel,
    ModelClass,
    repo,
    composableId,
    onError: onErrorCallbacks.add,
    onStandardError: onStandardErrorCallbacks.add,
    onSuccess: onSuccessCallbacks.add,
    onValidationError: onValidationErrorCallbacks.add,
    onPaginateImmediate: onPaginateImmediateCallbacks.add,
  }
}
