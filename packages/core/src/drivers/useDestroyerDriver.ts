import { Item, Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue } from 'vue'
import { UseDestroyerOptions, UseDestroyerReturn } from '../contracts/crud/destroy/UseDestroyer'
import { getDriverKey } from '../utils/getDriverKey'
import { DestroyResponse, DestroySuccessResponse } from '../types/Response'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { getFirstDefined } from '../utils/getFirstDefined'
import clone from 'just-clone'
import { destroy as destroyResource } from '../actions/destroy'
import { generateRandomString } from '../utils/generateRandomString'
import { OnDestroyOptimisticPersistMessage, OnDestroyPersistMessage } from '../broadcasting/BroadcastMessages'
import { deepmerge } from 'deepmerge-ts'

const defaultOptions = {
  persist: true,
}

export function useDestroyerDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseDestroyerOptions<T>,
): UseDestroyerReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)
  const driverKey = getDriverKey(options.driver)

  const destroyOptimisticPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.destroyOptimisticPersist`)
  const destroyOptimisticPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.destroyOptimisticPersist`)
  const destroyPersistChannel = new BroadcastChannel(`vuemodel.${driverKey}.destroyPersist`)
  const destroyPersistEntityChannel = new BroadcastChannel(`vuemodel.${driverKey}.${ModelClass.entity}.destroyPersist`)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const destroyPersistHooks = deepmerge(driverConfig.hooks?.destroyPersist ?? [])
  const destroyOptimisticPersistHooks = deepmerge(driverConfig.hooks?.destroyOptimisticPersist ?? [])

  const activeRequests = ref<UseDestroyerReturn<T>['activeRequests']>({} as UseDestroyerReturn<T>['activeRequests'])

  const response = ref<DestroyResponse<T>>()
  const activeRequest = ref<Promise<DestroyResponse<T>> & { cancel(): void }>()
  const recordBeingRemoved = ref<Item<InstanceType<T>>>()

  function cancel () {
    activeRequest.value?.cancel()
  }

  const destroying = ref<string | number | string[] | number[] | false>(false)

  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const record = computed(() => {
    if (recordBeingRemoved.value) {
      return recordBeingRemoved as Item<InstanceType<T>>
    }

    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return repo.make(responseRecord)
  })

  async function destroy (idParam?: string | number | string[] | number[]) {
    response.value = undefined

    let resolvedId = idParam ?? toValue(options?.id)
    if (Array.isArray(resolvedId)) resolvedId = JSON.stringify(resolvedId)

    if (!resolvedId) {
      console.warn('trying to destroy a record without an id')
      resolvedId = ''
    }

    const persist = !!toValue(options?.persist)
    const optimistic = getFirstDefined<boolean>([toValue(options?.optimistic), driverConfig.optimistic]) &&
      persist

    const recordForRemoval = repo.find(resolvedId)
    let clonedRecord: Item<InstanceType<T>> = null
    if (recordForRemoval) {
      clonedRecord = clone(recordForRemoval)
    }
    recordBeingRemoved.value = clonedRecord

    if (optimistic && persist) {
      repo.destroy(resolvedId)

      const destroyPersistMessage: OnDestroyOptimisticPersistMessage = clone({
        entity: ModelClass.entity,
        id: resolvedId,
      })

      destroyOptimisticPersistHooks.forEach(async hook => await hook({
        ModelClass,
        entity: ModelClass.entity,
        id: resolvedId,
      }))

      destroyOptimisticPersistChannel.postMessage(destroyPersistMessage)
      destroyOptimisticPersistEntityChannel.postMessage(destroyPersistMessage)
    }

    const controller = new AbortController()
    const signal = controller.signal

    destroying.value = resolvedId
    const request = destroyResource(
      ModelClass,
      String(resolvedId),
      {
        driver: driverKey,
        notifyOnError: options?.notifyOnError,
        signal,
        throw: false,
      },
    ) as Promise<DestroyResponse<T>> & { cancel(): void }

    request.cancel = () => {
      controller.abort()
    }

    activeRequest.value = request

    activeRequests.value[resolvedId] = { request }

    response.value = await request
    activeRequest.value = undefined

    // Persisting to the store
    if (persist && response.value?.record) {
      repo.destroy(resolvedId)

      if (response.value.success) {
        const destroyPersistMessage: OnDestroyPersistMessage<T> = clone({
          entity: ModelClass.entity,
          response: response.value,
        })

        destroyPersistHooks.forEach(async hook => await hook({
          ModelClass,
          entity: ModelClass.entity,
          response: response.value as DestroySuccessResponse<typeof Model>,
        }))

        destroyPersistChannel.postMessage(destroyPersistMessage)
        destroyPersistEntityChannel.postMessage(destroyPersistMessage)
      }
    }

    // On Success
    if (response.value?.success) {
      const responseResolved = toValue(response)
      if (responseResolved) {
        options?.onSuccess?.(responseResolved as DestroySuccessResponse<T>)
      }
    }

    // On standard error
    if (response.value.standardErrors) {
      options?.onStandardError?.(response.value)
    }

    if (!response.value.success && optimistic && persist && clonedRecord) {
      repo.insert(clonedRecord)
    }

    destroying.value = false
    recordBeingRemoved.value = undefined

    return request
  }

  return {
    response,
    destroying,
    destroy,
    cancel,
    record,
    activeRequests,
    standardErrors,
    ModelClass,
    repo,
    composableId,
  }
}
