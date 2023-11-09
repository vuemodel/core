import { Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue } from 'vue'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { UseFindResourceOptions, UseFindResourceReturn } from '../contracts/crud/find/UseFindResource'
import { getImplementation } from '../getImplementation'
import { FindResponse } from '../types/ResourceResponse'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { Constructor } from '../types/Constructor'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { applyIncludes } from '../utils/applyIncludes'

const defaultOptions = {
  persist: true,
}

export function useFindResourceImplementation<T extends typeof Model> (
  EntityClass: T,
  options?: UseFindResourceOptions<T>,
): UseFindResourceReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const findResource = getImplementation<T, 'findResource'>('findResource', options.driver)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    EntityClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const activeRequests = ref<UseFindResourceReturn<T>['activeRequests']>({} as UseFindResourceReturn<T>['activeRequests'])

  const response = ref<FindResponse<T>>()

  const finding = ref<string | number>()

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as QueryValidationErrors
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  function getRecordId (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>) {
    const primaryKeyField = EntityClass.primaryKey
    if (Array.isArray(primaryKeyField)) {
      const key = pick(rawRecord, primaryKeyField as (keyof typeof rawRecord)[])
      return key ? String(key) : undefined
    }

    const key = rawRecord?.[primaryKeyField as keyof DeclassifyPiniaOrmModel<InstanceType<T>>]
    return key ? String(key) : undefined
  }

  function makeQuery (idParam?: string | number) {
    const includesObject = toValue(options?.includes)
    const query = repo.query()
    if (includesObject) {
      applyIncludes(EntityClass, query, includesObject)
    }
    const idResolved = idParam ??
      (response.value?.record ? getRecordId(response.value?.record) : undefined) ??
      toValue(options?.id) ??
      ''

    return query.whereId(idResolved)
  }

  function getRecordFromRepo (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const id = getRecordId(rawRecord)

    return id ? makeQuery(id).first() : null
  }

  const record = computed(() => {
    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return getRecordFromRepo(responseRecord)
  })

  async function find (idParam?: string | number) {
    response.value = undefined

    let resolvedId = idParam ?? toValue(options?.id)

    if (!resolvedId) {
      console.warn('trying to find a record without an id')
      resolvedId = ''
    }

    const persist = !!toValue(options?.persist)

    finding.value = resolvedId
    const request = findResource(
      EntityClass,
      String(resolvedId),
      {
        driver: options?.driver,
        notifyOnError: options?.notifyOnError,
        includes: toValue(options?.includes),
      },
    )

    activeRequests.value[resolvedId] = { request }

    const thisResponse = await request
    response.value = thisResponse

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo.save(thisResponse?.record)
    }

    // On Success
    if (thisResponse?.success) {
      const responseResolved = toValue(response)
      if (responseResolved) {
        options?.onSuccess?.(responseResolved)
      }
    }

    // On validation error
    if (thisResponse.validationErrors) {
      options?.onValidationError?.(thisResponse)
    }

    // On standard error
    if (thisResponse.standardErrors) {
      options?.onStandardError?.(thisResponse)
    }

    // On any error
    if (thisResponse.validationErrors || thisResponse.standardErrors) {
      options?.onError?.(thisResponse)
    }

    finding.value = undefined
  }

  if (options.immediate) {
    find()
  }

  return {
    response,
    validationErrors,
    finding,
    find,
    record,
    activeRequests,
    standardErrors,
    makeQuery,
  }
}
