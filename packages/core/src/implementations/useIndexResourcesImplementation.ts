import { Model, useRepo } from 'pinia-orm'
import { Ref, computed, nextTick, ref, toValue } from 'vue'
import { UseIndexResourcesOptions, UseIndexResourcesReturn } from '../contracts/crud/index/UseIndexResources'
import { IndexResponse } from '../types/ResourceResponse'
import { getImplementation } from '../getImplementation'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { applyIncludes } from '../utils/applyIncludes'
import { applyFilters } from '../utils/applyFilters'
import { applySortBys } from '../utils/applySortBys'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { PaginationDetails } from '../contracts/crud/index/PaginationDetails'
import { hasProperty } from '../utils/hasProperty'
import { watchPausable } from '@vueuse/core'
import { resolveScopes } from './resolveScopes'
import { vueModelState } from '../plugin/state'
import deepmerge from 'deepmerge'

const defaultOptions = {
  persist: true,
}

export function useIndexResourcesImplementation<T extends typeof Model> (
  EntityClass: T,
  options?: UseIndexResourcesOptions<T>,
): UseIndexResourcesReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const indexResources = getImplementation<T, 'indexResources'>('indexResources', options.driver)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    EntityClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )
  const pagination: Ref<PaginationDetails> = ref(options.pagination ?? {} as PaginationDetails)
  const {
    pause: pauseImmediatePaginationWatcher,
    resume: resumeImmediatePaginationWatcher,
  } = watchPausable(
    [
      () => pagination.value.currentPage,
      () => pagination.value.recordsPerPage,
    ],
    (newValues, oldValues) => {
      const [newCurrentPage, newRecordsPerPage] = newValues
      const [oldCurrentPage, oldRecordsPerPage] = oldValues
      if (
        toValue(options?.immediatelyPaginate) &&
        ((newCurrentPage !== oldCurrentPage) || (newRecordsPerPage !== oldRecordsPerPage)) &&
        (newCurrentPage && newRecordsPerPage)
      ) {
        index()
      }
    })

  const response = ref<IndexResponse<T>>()

  const indexing = ref(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as QueryValidationErrors
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const ids = computed(() => {
    return response.value?.records?.map(record => record[String(EntityClass.primaryKey)]) ?? []
  })

  function makeQuery () {
    const includesObject = toValue(options?.includes ?? {})
    const filtersObject = toValue(options?.filters ?? {})
    const sortByArray = toValue(options?.sortBy ?? [])

    const query = repo.query()

    if (toValue(ids).length) query.whereId(toValue(ids))
    if (includesObject) applyIncludes(EntityClass, query, includesObject)
    if (filtersObject) applyFilters(query, filtersObject)
    if (sortByArray) applySortBys(query, sortByArray)

    return query
  }

  const records = computed(() => {
    const responseRecords = response.value?.records
    if (!responseRecords) return []

    return makeQuery().get()
  })

  const index: UseIndexResourcesReturn<T>['index'] = async function index (
    optionsParam = {},
  ) {
    pauseImmediatePaginationWatcher()
    response.value = undefined

    const resolvedScopes = resolveScopes(
      options?.driver ?? vueModelState.default ?? 'default',
      EntityClass.entity,
      options?.scopes,
      {
        withoutEntityGlobalScopes: toValue(options?.withoutEntityGlobalScopes),
        withoutGlobalScopes: toValue(options?.withoutGlobalScopes),
      },
    )

    const filters = deepmerge(
      toValue(options?.filters) ?? {},
      resolvedScopes.filters ?? {},
    )
    const includes = deepmerge(
      toValue(options?.includes) ?? {},
      resolvedScopes.includes ?? {},
    )
    const sortBy = [...(toValue(options?.sortBy) ?? []), ...resolvedScopes.sortBy]

    const paginationMerged = {
      ...(driverConfig.pagination ?? {}),
      ...(toValue(pagination.value) ?? {}),
    }

    if (hasProperty(optionsParam, 'page')) paginationMerged.currentPage = optionsParam.page
    if (hasProperty(optionsParam, 'recordsPerPage')) paginationMerged.recordsPerPage = optionsParam.recordsPerPage
    if (typeof paginationMerged.currentPage !== 'number') {
      paginationMerged.currentPage = 1
      pagination.value.currentPage = 1
    }

    const notifyOnError = toValue(options?.notifyOnError)

    const persist = !!toValue(options?.persist)

    indexing.value = true

    const request = indexResources(
      EntityClass,
      {
        filters,
        includes,
        sortBy,
        notifyOnError,
        pagination: {
          recordsPerPage: paginationMerged?.recordsPerPage,
          page: paginationMerged?.currentPage,
        },
      },
    )

    nextTick(() => resumeImmediatePaginationWatcher())

    response.value = await request

    pauseImmediatePaginationWatcher()
    if (response.value.pagination) {
      pauseImmediatePaginationWatcher()
      pagination.value = response.value.pagination
      resumeImmediatePaginationWatcher()
    }

    // Persisting to the store
    if (persist && response.value?.records?.length) {
      repo.save(response.value?.records)
    }

    // On Success
    if (response.value?.success) {
      const responseResolved = toValue(response)
      if (responseResolved) {
        options?.onSuccess?.(responseResolved)
      }
    }

    // On validation error
    if (response.value.validationErrors) {
      options?.onValidationError?.(response.value)
    }

    // On standard error
    if (response.value.standardErrors) {
      options?.onStandardError?.(response.value)
    }

    // On any error
    if (response.value.validationErrors || response.value.standardErrors) {
      options?.onError?.(response.value)
    }

    indexing.value = false
    nextTick(() => resumeImmediatePaginationWatcher())
  }

  async function next () {
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.recordsPerPage) {
      throw new Error("Cannot paginate to next records. 'recordsPerPage' must be set.")
    }
    const currentPage = paginationResolved.currentPage
    pauseImmediatePaginationWatcher()
    pagination.value.currentPage = currentPage ? (currentPage + 1) : 1
    resumeImmediatePaginationWatcher()

    await index()
  }

  async function previous () {
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.recordsPerPage) {
      throw new Error("Cannot paginate to previous records. 'recordsPerPage' must be set.")
    }
    const currentPage = paginationResolved.currentPage
    pauseImmediatePaginationWatcher()
    pagination.value.currentPage = currentPage ? (currentPage - 1) : 1
    resumeImmediatePaginationWatcher()
    await index()
  }

  async function toPage (pageNumber: number) {
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.recordsPerPage) {
      throw new Error(`Cannot paginate to page '${pageNumber}'. 'recordsPerPage' must be set.`)
    }
    pauseImmediatePaginationWatcher()
    pagination.value.currentPage = pageNumber
    resumeImmediatePaginationWatcher()

    await index()
  }

  async function toLastPage () {
    if (!pagination.value.recordsPerPage) {
      throw new Error("Cannot paginate to last page. 'recordsPerPage' must be set.")
    }
    // If we don't have the pageCount, perform a request
    // so that we have it.
    if (!toValue(pagination).pagesCount) {
      const tempResponse = await indexResources(EntityClass, {
        pagination: { recordsPerPage: pagination.value.recordsPerPage },
      })
      pagination.value.pagesCount = tempResponse.pagination?.pagesCount
    }
    const paginationResolved = toValue(pagination)
    if (!paginationResolved.pagesCount) {
      throw new Error('Cannot discover last page. Ensure "index()" has been called at least once.')
    }
    await toPage(paginationResolved.pagesCount)
  }

  async function toFirstPage () {
    await toPage(1)
  }

  if (options.immediate) {
    index()
  }

  const isLastPage = computed(() => {
    if (!pagination.value.pagesCount || !pagination.value.currentPage) return
    return pagination.value.currentPage >= pagination.value.pagesCount
  })

  const isFirstPage = computed(() => {
    if (!pagination.value.pagesCount || !pagination.value.currentPage) return
    return pagination.value.currentPage === 1
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
  }
}
