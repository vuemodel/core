import { Item, Model, useRepo } from 'pinia-orm'
import { computed, ref, toValue } from 'vue'
import { UseRemoveResourceOptions, UseRemoveResourceReturn } from '../contracts/crud/remove/UseRemoveResource'
import { getImplementation } from '../getImplementation'
import { RemoveResponse } from '../types/ResourceResponse'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'

const defaultOptions = {
  persist: true,
}

export function useRemoveResourceImplementation<T extends typeof Model> (
  EntityClass: T,
  options?: UseRemoveResourceOptions<T>,
): UseRemoveResourceReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const removeResource = getImplementation<T, 'removeResource'>('removeResource', options.driver)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    EntityClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const activeRequests = ref<UseRemoveResourceReturn<T>['activeRequests']>({} as UseRemoveResourceReturn<T>['activeRequests'])

  const response = ref<RemoveResponse<T>>()

  const removing = ref<string | number>()

  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const record = computed(() => {
    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return repo.make(responseRecord)
  })

  async function remove (idParam?: string | number) {
    response.value = undefined

    let resolvedId = idParam ?? toValue(options?.id)

    if (!resolvedId) {
      console.warn('trying to remove a record without an id')
      resolvedId = ''
    }

    const persist = !!toValue(options?.persist)
    const optimistic = !!toValue(options?.optimistic) && persist

    removing.value = resolvedId

    const recordForRemoval = repo.find(resolvedId)
    let clonedRecord: Item<InstanceType<T>> = null
    if (recordForRemoval) {
      clonedRecord = structuredClone(recordForRemoval)
    }

    if (optimistic && persist) {
      repo.destroy(resolvedId)
    }

    const request = removeResource(
      EntityClass,
      String(resolvedId),
      {
        driver: options?.driver,
        notifyOnError: options?.notifyOnError,
      },
    )

    activeRequests.value[resolvedId] = { request }

    response.value = await request

    // Persisting to the store
    if (persist && response.value?.record) {
      repo.destroy(resolvedId)
    }

    // On Success
    if (response.value?.success) {
      const responseResolved = toValue(response)
      if (responseResolved) {
        options?.onSuccess?.(responseResolved)
      }
    }

    // On standard error
    if (response.value.standardErrors) {
      options?.onStandardError?.(response.value)
    }

    if (!response.value.success && optimistic && persist && clonedRecord) {
      repo.insert(clonedRecord)
    }

    removing.value = undefined
  }

  return {
    response,
    removing,
    remove,
    record,
    activeRequests,
    standardErrors,
  }
}
