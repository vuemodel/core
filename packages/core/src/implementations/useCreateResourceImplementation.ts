import { Model, PrimaryKey, useRepo } from 'pinia-orm'
import { Ref, computed, ref, toValue } from 'vue'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { UseCreateResourceOptions, UseCreateResourceReturn } from '../contracts/crud/create/UseCreateResource'
import { getImplementation } from '../getImplementation'
import { CreateResponse } from '../types/ResourceResponse'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { v4 as uuidV4 } from 'uuid'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'

const defaultOptions = {
  persist: true,
}

export function useCreateResourceImplementation<T extends typeof Model> (
  EntityClass: T,
  options?: UseCreateResourceOptions<T>,
): UseCreateResourceReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const createResource = getImplementation<T, 'createResource'>('createResource', options.driver)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    EntityClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const form = ref(options.form ?? {}) as Ref<PiniaOrmForm<InstanceType<T>>>

  const activeRequests = ref<UseCreateResourceReturn<T>['activeRequests']>({} as UseCreateResourceReturn<T>['activeRequests'])

  const response = ref<CreateResponse<T>>()

  const creating = ref(false)

  const validationErrors = computed(() => {
    return response.value?.validationErrors ?? {} as FormValidationErrors<T>
  })
  const standardErrors = computed(() => {
    return response.value?.standardErrors ?? [] as StandardErrors
  })

  const optimisticRecord = ref<InstanceType<T>>()

  function getRecordId (rawRecord: PiniaOrmForm<InstanceType<T>> | DeclassifyPiniaOrmModel<InstanceType<T>> | InstanceType<T>) {
    const primaryKeyField = EntityClass.primaryKey
    if (Array.isArray(primaryKeyField)) {
      const key = pick(rawRecord, primaryKeyField as (keyof typeof rawRecord)[])
      return key ? String(key) : undefined
    }

    const key = rawRecord?.[primaryKeyField as (keyof typeof rawRecord)]
    return key ? String(key) : undefined
  }

  function getRecordFromRepo (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const id = getRecordId(rawRecord)
    return id ? repo.find(id) : null
  }

  const record = computed(() => {
    if (!response.value && !!optimisticRecord.value) {
      return getRecordFromRepo(optimisticRecord.value)
    }

    const responseRecord = response.value?.record
    if (!responseRecord) return null

    return getRecordFromRepo(responseRecord)
  })

  async function create (paramForm?: PiniaOrmForm<InstanceType<T>>) {
    response.value = undefined
    optimisticRecord.value = undefined

    const mergedForm = Object.assign(
      {},
      toValue(options?.merge) ?? {},
      form.value,
      toValue(options?.form) ?? {},
      paramForm ?? {},
    ) as PiniaOrmForm<InstanceType<T>> & { id: PrimaryKey }

    const persist = !!toValue(options?.persist)
    const optimistic = !!toValue(options?.optimistic) && persist

    let requestId = getRecordId(mergedForm)
    if (!requestId) {
      requestId = uuidV4()
      mergedForm.id = requestId
    }

    let thisOptimisticRecord: InstanceType<T> | undefined
    if (optimistic && persist) {
      thisOptimisticRecord = repo.insert(mergedForm)
      optimisticRecord.value = thisOptimisticRecord
    } else {
      thisOptimisticRecord = undefined
    }

    creating.value = true
    const request = createResource(
      EntityClass,
      mergedForm,
      { driver: options?.driver, notifyOnError: options?.notifyOnError },
    )

    activeRequests.value[requestId] = { request, form: structuredClone(mergedForm) }

    const thisResponse = await request
    response.value = thisResponse

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo.insert(thisResponse.record)
    }

    // On Success
    if (thisResponse?.success) {
      if (Object.keys(activeRequests.value).length <= 1) { form.value = {} }
    }

    // On Error
    if (
      !thisResponse?.success
    ) {
      if (optimistic && thisOptimisticRecord) {
        repo.destroy(requestId)
      }
    }
    delete activeRequests.value[requestId]

    creating.value = false
  }

  return {
    response,
    validationErrors,
    form,
    creating,
    create,
    record,
    activeRequests,
    standardErrors,
  }
}
