import { Item, Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue } from 'vue'
import { UseDestroyerOptions, UseDestroyerReturn } from '../contracts/crud/destroy/UseDestroyer'
import { getImplementation } from '../getImplementation'
import { DestroyResponse, DestroySuccessResponse } from '../types/Response'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'

const defaultOptions = {
  persist: true,
}

export function useDestroyerImplementation<T extends typeof Model> (
  ModelClass: T,
  options?: UseDestroyerOptions<T>,
): UseDestroyerReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const destroyResource = getImplementation<T, 'destroy'>('destroy', options.driver)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const activeRequests = ref<UseDestroyerReturn<T>['activeRequests']>({} as UseDestroyerReturn<T>['activeRequests'])

  const response = ref<DestroyResponse<T>>()
  const activeRequest = ref<Promise<DestroyResponse<T>> & { cancel(): void }>()

  function cancel () {
    activeRequest.value?.cancel()
  }

  const destroying = ref<string | number | string[] | number[] | false>(false)

  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const record = computed(() => {
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
    const optimistic = !!toValue(options?.optimistic) && persist

    const recordForRemoval = repo.find(resolvedId)
    let clonedRecord: Item<InstanceType<T>> = null
    if (recordForRemoval) {
      clonedRecord = structuredClone(recordForRemoval)
    }

    if (optimistic && persist) {
      repo.destroy(resolvedId)
    }

    const controller = new AbortController()
    const signal = controller.signal

    destroying.value = resolvedId
    const request = destroyResource(
      ModelClass,
      String(resolvedId),
      {
        driver: options?.driver,
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
  }
}