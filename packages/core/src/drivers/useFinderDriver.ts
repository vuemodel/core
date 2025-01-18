import { Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue, watch } from 'vue'
import { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { UseFinderOptions, UseFinderReturn } from '../contracts/crud/find/UseFinder'
import { getDriverKey } from '../utils/getDriverKey'
import { FindResponse } from '../types/Response'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { Constructor } from '../types/Constructor'
import { QueryValidationErrors } from '../contracts/errors/QueryValidationErrors'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { applyWiths } from '../utils/applyWiths'
import { resolveScopes } from './resolveScopes'
import { vueModelState } from '../plugin/state'
import { deepmerge } from 'deepmerge-ts'
import { makeWithQuery } from '../utils/makeWithQuery'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { IndexWithsLoose } from '../contracts/crud/index/IndexWithsLoose'
import { IndexWiths } from '../contracts/crud/index/IndexWiths'
import { getFirstDefined } from '../utils/getFirstDefined'
import { find as findResource } from '../actions/find'
import { generateRandomString } from '../utils/generateRandomString'
import { OnFindPersistMessage } from '../broadcasting/BroadcastMessages'
import clone from 'just-clone'

const defaultOptions = {
  persist: true,
  persistBy: 'save',
}

export function useFinderDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseFinderOptions<T>,
): UseFinderReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  const findPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.findPersist`)
  const findPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.findPersist`)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const findPersistHooks = deepmerge(driverConfig.hooks?.findPersist ?? [])

  const response = ref<FindResponse<T>>()
  const activeRequest = ref<Promise<FindResponse<T>> & { cancel(): void }>()

  function cancel () {
    activeRequest.value?.cancel()
  }

  const finding = ref<string | number | string[] | number[] | false>(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as QueryValidationErrors
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  function getRecordId (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>) {
    const primaryKeyField = ModelClass.primaryKey
    if (Array.isArray(primaryKeyField)) {
      const key = pick(rawRecord, primaryKeyField as unknown as (keyof typeof rawRecord)[])
      return key ? String(key) : undefined
    }

    const key = rawRecord?.[primaryKeyField as keyof DeclassifyPiniaOrmModel<InstanceType<T>>]
    return key ? String(key) : undefined
  }

  function makeQuery (idParam?: string | number) {
    const withObject = makeWithQuery(toValue(options?.with) as string | string[] | IndexWithsLoose)
    const query = repo.query()
    if (withObject) {
      applyWiths(ModelClass, query, withObject)
    }
    const idResolved = idParam ??
      (response.value?.record ? getRecordId(response.value?.record) : undefined) ??
      toValue(options?.id) ??
      ''

    return query.whereId(idResolved)
  }

  function getRecordFromRepo (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const id = getRecordPrimaryKey(ModelClass, rawRecord)

    return id ? makeQuery(id).first() : null
  }

  const record = computed(() => {
    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return getRecordFromRepo(responseRecord)
  })

  async function find (idParam?: string | number | string[] | number[]) {
    response.value = undefined

    let resolvedId = idParam ?? toValue(options?.id)
    if (Array.isArray(resolvedId)) resolvedId = JSON.stringify(resolvedId)

    if (!resolvedId) {
      console.warn('trying to find a record without an id')
      resolvedId = ''
    }

    const resolvedScopes = resolveScopes(
      ModelClass,
      options?.driver ?? vueModelState.default ?? 'default',
      ModelClass.entity,
      undefined,
      {
        withoutEntityGlobalScopes: toValue(options?.withoutEntityGlobalScopes),
        withoutGlobalScopes: toValue(options?.withoutGlobalScopes),
      },
    )

    const withQuery = makeWithQuery(toValue(options?.with) as string | string[] | IndexWithsLoose)

    const withMerged = deepmerge(
      withQuery,
      resolvedScopes.with ?? {},
    ) as IndexWiths<InstanceType<T>>

    const controller = new AbortController()
    const signal = controller.signal

    finding.value = resolvedId
    const request = findResource(
      ModelClass,
      String(resolvedId),
      {
        driver: driverKey,
        notifyOnError: options?.notifyOnError,
        with: withMerged,
        signal,
        throw: false,
      },
    )

    activeRequest.value = {
      ...request,
      cancel: () => {
        controller.abort()
      },
    }

    const thisResponse = await request
    activeRequest.value = undefined
    response.value = thisResponse

    const persist = !!toValue(options?.persist)
    const persistBy = toValue(options?.persistBy ?? 'save')

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo[persistBy](thisResponse?.record)

      if (thisResponse.success) {
        const findPersistMessage: OnFindPersistMessage<T> = clone({
          entity: ModelClass.entity,
          response: thisResponse,
          with: withMerged,
        })

        findPersistHooks.forEach(async hook => await hook({
          ModelClass,
          entity: ModelClass.entity,
          response: thisResponse,
          with: withMerged,
        }))

        findPersistChannel.postMessage(findPersistMessage)
        findPersistEntityChannel.postMessage(findPersistMessage)
      }
    }

    // On Success
    if (thisResponse?.success) {
      if (thisResponse) {
        options?.onSuccess?.(thisResponse)
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
    if (!thisResponse.success) {
      options?.onError?.(thisResponse)
    }

    finding.value = false

    return thisResponse
  }

  if (getFirstDefined([toValue(options.immediate), driverConfig.immediate])) {
    find()
  }

  watch(
    () => toValue(options?.id),
    () => {
      if (getFirstDefined([toValue(options?.immediate), driverConfig.immediate])) {
        find()
      }
    },
  )

  return {
    response,
    validationErrors,
    finding,
    find,
    record,
    standardErrors,
    makeQuery,
    cancel,
    ModelClass,
    repo,
    composableId,
  }
}
