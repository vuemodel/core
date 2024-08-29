import { Model, PrimaryKey, useRepo } from 'pinia-orm'
import { Ref, computed, ref, toValue } from 'vue'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { UseCreatorOptions, UseCreatorReturn } from '../contracts/crud/create/UseCreator'
import { CreateResponse } from '../types/Response'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { Constructor } from '../types/Constructor'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { getFirstDefined } from '../utils/getFirstDefined'
import clone from 'just-clone'
import { create as createResource } from '../actions/create'
import { getDriverKey } from '../utils/getDriverKey'
import { generateRandomString } from '../utils/generateRandomString'
import { makeId } from '../utils/makeId'

const defaultOptions = {
  persist: true,
}

export function useCreatorDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseCreatorOptions<T>,
): UseCreatorReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const composableId = generateRandomString(8)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const form = ref(options.form ?? {}) as Ref<PiniaOrmForm<InstanceType<T>>>

  const activeRequests = ref<UseCreatorReturn<T>['activeRequests']>({} as UseCreatorReturn<T>['activeRequests'])
  const activeRequest = ref<Promise<CreateResponse<T>> & { cancel(): void }>()

  function cancel () {
    activeRequest.value?.cancel()
  }
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
    const primaryKeyField = ModelClass.primaryKey
    if (Array.isArray(primaryKeyField)) {
      const key = pick(rawRecord, primaryKeyField as unknown as (keyof typeof rawRecord)[])
      return key ? String(key) : undefined
    }

    const key = rawRecord?.[primaryKeyField as unknown as (keyof typeof rawRecord)]
    return key ? String(key) : undefined
  }

  function getRecordFromRepo (rawRecord: DeclassifyPiniaOrmModel<InstanceType<T>>) {
    const id = getRecordPrimaryKey(ModelClass, rawRecord)
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
    const optimistic = getFirstDefined<boolean>([toValue(options?.optimistic), driverConfig.optimistic]) &&
      persist

    let requestId = getRecordId(mergedForm)
    const primaryKey = ModelClass.primaryKey
    if (!requestId) {
      requestId = makeId(ModelClass, driverConfig)
      // @ts-expect-error we know primaryKey is a property on mergedForm
      mergedForm[primaryKey] = requestId
    }

    let thisOptimisticRecord: InstanceType<T> | undefined
    if (optimistic && persist) {
      thisOptimisticRecord = repo.insert(mergedForm)
      optimisticRecord.value = thisOptimisticRecord
    } else {
      thisOptimisticRecord = undefined
    }

    const controller = new AbortController()
    const signal = controller.signal

    creating.value = true
    const request = createResource(
      ModelClass,
      mergedForm,
      {
        driver: getDriverKey(options?.driver),
        notifyOnError: options?.notifyOnError,
        signal,
        throw: false,
      },
    ) as Promise<CreateResponse<T>> & { cancel(): void }

    request.cancel = () => {
      controller.abort()
    }

    activeRequests.value[requestId] = { request, form: clone(mergedForm) }

    activeRequest.value = request

    const thisResponse = await request
    activeRequest.value = undefined
    response.value = thisResponse

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo.insert(thisResponse.record)
    }

    // On Success
    if (thisResponse?.success) {
      if (Object.keys(activeRequests.value).length <= 1) { form.value = {} }
      if (thisResponse) {
        options?.onSuccess?.(thisResponse)
      }
    }

    // On validation error
    if (thisResponse.validationErrors && !thisResponse.success) {
      options?.onValidationError?.(thisResponse, thisResponse.validationErrors)
    }

    // On standard error
    if (thisResponse.standardErrors) {
      options?.onStandardError?.(thisResponse)
    }

    // On Error
    if (
      !thisResponse?.success
    ) {
      if (optimistic && thisOptimisticRecord) {
        repo.destroy(requestId)
      }
      options?.onError?.(thisResponse)
    }
    delete activeRequests.value[requestId]

    creating.value = false

    return request
  }

  return {
    response,
    validationErrors,
    form,
    creating,
    create,
    cancel,
    record,
    activeRequests,
    standardErrors,
    ModelClass,
    repo,
    composableId,
  }
}
