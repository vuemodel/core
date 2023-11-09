import { Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue } from 'vue'
import { UseIndexResourcesOptions, UseIndexResourcesReturn } from '../contracts/crud/index/UseIndexResources'
import { IndexResponse } from '../types/ResourceResponse'
import { getImplementation } from '../getImplementation'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { IndexResourcesIncludes } from '../contracts/crud/index/IndexResourcesIncludes'
import { SortBy } from '../contracts/crud/index/IndexResourcesSorts'
import { Constructor } from '../types/Constructor'
import { applyIncludes } from '../utils/applyIncludes'
import { applyFilters } from '../utils/applyFilters'
import { applySortBys } from '../utils/applySortBys'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'

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

  const response = ref<IndexResponse<T>>()

  const indexing: UseIndexResourcesReturn<T>['indexing'] = ref(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as QueryValidationErrors
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  function makeQuery () {
    const includesObject = toValue(options?.includes)
    const filtersObject = toValue(options?.filters)
    const sortByArray = toValue(options?.sortBy)
    const query = repo.query()
    if (includesObject) applyIncludes(EntityClass, query, includesObject)
    if (filtersObject) applyFilters(query, filtersObject)
    if (sortByArray) applySortBys(query, sortByArray)

    return query
  }

  const records: UseIndexResourcesReturn<T>['records'] = computed(() => {
    const responseRecords = response.value?.records
    if (!responseRecords) return []

    return makeQuery().get()
  })

  async function index () {
    response.value = undefined

    const filters = toValue(options?.filters)
    const includes = toValue(options?.includes) as IndexResourcesIncludes<T> | undefined
    const sortBy = toValue(options?.sortBy) as SortBy<T> | undefined
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
      },
    )

    response.value = await request

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
  }

  if (options.immediate) {
    index()
  }

  return {
    response,
    validationErrors,
    records,
    indexing,
    index,
    standardErrors,
    makeQuery,
  }
}
