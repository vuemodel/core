import { Item, Model, useRepo } from 'pinia-orm'
import { Ref, computed, nextTick, ref, toValue, watch } from 'vue'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { UseUpdaterOptions, UseUpdaterReturn } from '../contracts/crud/update/UseUpdater'
import { UpdateErrorResponse, UpdateResponse } from '../types/Response'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { Constructor } from '../types/Constructor'
import { populateFormWithRecord as populateFormWithRecordUtil } from '../utils/populateFormWithRecord'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import debounce from 'debounce'
import { getRecordPrimaryKey } from '../utils/getRecordPrimaryKey'
import { getFirstDefined } from '../utils/getFirstDefined'
import clone from 'just-clone'
import { watchPausable } from '@vueuse/core'
import deepEqual from 'deep-equal'
import { generateRandomString } from '../utils/generateRandomString'
import { update as updateResource } from '../actions/update'
import { getDriverKey } from '../utils/getDriverKey'
import { useFinder } from '../composables/useFinder'

const defaultOptions = {
  persist: true,
  excludeFields: [],
}

export function useUpdaterDriver<T extends typeof Model> (
  ModelClass: T,
  options?: UseUpdaterOptions<T>,
): UseUpdaterReturn<T> {
  options = Object.assign({}, defaultOptions, options)

  const composableId = generateRandomString(8)

  const resourceFinder = useFinder(ModelClass, {
    persist: true,
    driver: options.driver,
  })

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    ModelClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const form = ref(options.form ?? {}) as Ref<PiniaOrmForm<InstanceType<T>>>

  const activeRequests = ref<UseUpdaterReturn<T>['activeRequests']>({} as UseUpdaterReturn<T>['activeRequests'])
  const activeRequest = ref<Promise<UpdateResponse<T>> & { cancel(): void }>()
  const excludeFieldsResolved = options.excludeFields

  function cancel () {
    activeRequest.value?.cancel()
  }

  const response = ref<UpdateResponse<T>>()

  const updating = ref<string | number | string[] | number[] | false>(false)
  const makingForm = ref<string | number | string[] | number[] | false>(false)

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
      return getRecordPrimaryKey(ModelClass, rawRecord)
      // const key = pick(rawRecord, primaryKeyField as (keyof typeof rawRecord)[])
      // return
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

  function discoverIdAndFormFromParams (
    idOrFormParam?: PiniaOrmForm<InstanceType<T>> | string | number | (string | number)[],
    formParam?: PiniaOrmForm<InstanceType<T>>,
  ) {
    if (typeof idOrFormParam === 'string' || typeof idOrFormParam === 'number' || Array.isArray(idOrFormParam)) {
      // First api signature (only id)
      if (!formParam) {
        return {
          form: {},
          id: Array.isArray(idOrFormParam) ? JSON.stringify(idOrFormParam) : idOrFormParam,
        }
      } else {
        // Second api signature (id and form)
        return {
          form: formParam,
          id: Array.isArray(idOrFormParam) ? JSON.stringify(idOrFormParam) : idOrFormParam,
        }
      }
      // third api signature (only form)
    } else if (typeof idOrFormParam === 'object') {
      return {
        form: idOrFormParam,
      }
    }

    return { }
  }

  async function makeForm (targetId?: string | number | string[] | number[]) {
    let id = targetId ?? toValue(options?.id)
    if (Array.isArray(id)) id = JSON.stringify(id)
    if (!id) {
      return {}
    }
    const foundRecord = repo.find(id)
    if (!foundRecord) {
      makingForm.value = id
      try {
        await resourceFinder.find(id)
        const foundRecord = repo.find(id)
        if (foundRecord) {
          populateFormWithRecord(foundRecord, form, excludeFieldsResolved)
        }
      } catch (error) {
        console.error(
          `request failed for entity "${ModelClass.entity}", id "${id}", when attempting to populate form with record.`,
          error,
        )
      }
      makingForm.value = false
    } else {
      populateFormWithRecord(foundRecord, form)
    }

    return form.value
  }

  function getFormsChangedValues (
    targetId: string | number | string[] | number[],
    newValues: any,
  ) {
    let id = targetId ?? toValue(options?.id)
    if (Array.isArray(id)) id = JSON.stringify(id)

    if (!id) {
      return {}
    }

    const oldResource: any = repo.find(id)
    const resourceChangedValuesOnly: Record<string, any> = {}

    if (!oldResource) return {}

    Object.entries(newValues).forEach(([key, value]) => {
      if (typeof oldResource[key] === 'object') {
        if (!deepEqual(oldResource[key], newValues[key])) {
          resourceChangedValuesOnly[key] = value
        }
      } else {
        if (oldResource[key] !== newValues[key]) {
          resourceChangedValuesOnly[key] = value
        }
      }
    })
    return resourceChangedValuesOnly as PiniaOrmForm<InstanceType<T>>
  }

  async function update (
    idOrFormParam?: PiniaOrmForm<InstanceType<T>> | string | number | (string | number)[],
    formParam?: PiniaOrmForm<InstanceType<T>>,
  ) {
    response.value = undefined
    optimisticRecord.value = undefined

    const {
      form: resolvedFormParam,
      id: resolvedIdParam,
    } = discoverIdAndFormFromParams(idOrFormParam, formParam)

    const primaryKey = String(ModelClass.primaryKey)
    const mergedForm = Object.assign(
      {},
      form.value,
      toValue(options?.form) ?? {},
      resolvedFormParam ?? {},
    ) as PiniaOrmForm<InstanceType<T>>

    const optionsId = toValue(options?.id)
    if (resolvedIdParam || optionsId) {
      (mergedForm as any)[primaryKey] = resolvedIdParam ?? optionsId
    }

    let resolvedId = resolvedIdParam ?? toValue(options?.id) ?? getRecordId(mergedForm)
    if (Array.isArray(resolvedId)) resolvedId = JSON.stringify(resolvedId)

    if (!resolvedId) {
      response.value = {
        action: 'update',
        record: undefined,
        standardErrors: [{ message: '', name: 'no id' }],
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
        entity: ModelClass.entity,
      }
      return response.value
    }

    const persist = !!toValue(options?.persist)
    const optimistic = getFirstDefined<boolean>([toValue(options?.optimistic), driverConfig.optimistic]) &&
      persist

    const originalRecord = clone(repo.find(resolvedId) ?? {})

    const changedValues = getFormsChangedValues(String(resolvedId), mergedForm)

    let thisOptimisticRecord: InstanceType<T> | undefined
    if (optimistic && persist) {
      repo.destroy(resolvedId)
      thisOptimisticRecord = repo.insert(mergedForm)
      optimisticRecord.value = thisOptimisticRecord
    } else {
      thisOptimisticRecord = undefined
    }

    const controller = new AbortController()
    const signal = controller.signal

    updating.value = resolvedId
    const request = updateResource(
      ModelClass,
      String(resolvedId),
      changedValues,
      {
        driver: getDriverKey(options?.driver),
        notifyOnError: options?.notifyOnError,
        signal,
        throw: false,
      },
    ) as Promise<UpdateResponse<T>> & { cancel(): void }

    request.cancel = () => {
      controller.abort()
    }

    const requestId = generateRandomString(5)

    activeRequest.value = request

    activeRequests.value[requestId] = { request, form: clone(mergedForm) }

    const thisResponse = await request
    activeRequest.value = undefined
    response.value = thisResponse

    // Persisting to the store
    if (persist && thisResponse?.record && !optimistic) {
      // TODO: Is it still necessary to destroy the record first?
      repo.destroy(resolvedId)
      repo.insert(thisResponse?.record)
    }

    // On Success
    if (thisResponse?.success) {
      options?.onSuccess?.(thisResponse)
    }

    // On validation error
    if (thisResponse.validationErrors) {
      options?.onValidationError?.(thisResponse as UpdateErrorResponse<T>)
    }

    // On standard error
    if (thisResponse.standardErrors) {
      options?.onStandardError?.(thisResponse)
    }

    // On Error
    if (thisResponse.validationErrors || thisResponse.standardErrors) {
      options?.onError?.(thisResponse as UpdateErrorResponse<T>)
      if (optimistic && originalRecord) {
        repo.destroy(resolvedId)
        if (originalRecord) {
          repo.insert(originalRecord)
        }
      }
    }
    delete activeRequests.value[requestId]

    updating.value = false

    return thisResponse
  }

  const debounceMs = computed(() => {
    return toValue(options?.autoUpdateDebounce) ?? toValue(driverConfig.autoUpdateDebounce) ?? 150
  })

  const updateDebounced = computed(() => {
    return debounce(update, toValue(debounceMs))
  })

  const {
    pause: pauseAutoUpdater,
    resume: resumeAutoUpdater,
  } = watchPausable(form, (newForm) => {
    if (toValue(options?.autoUpdate) && Object.keys(newForm).length) {
      updateDebounced.value()
    }
  }, { deep: true })

  watch(() => toValue(options?.id), () => {
    if (typeof options?.id !== 'undefined' && options.immediatelyMakeForm) {
      makeForm()
    }
  }, { immediate: true })

  function populateFormWithRecord (
    record: Item<Model>,
    form: Ref<Record<string, any>>,
    excludeFields: string[] = [],
  ) {
    pauseAutoUpdater()
    populateFormWithRecordUtil(record, form, excludeFields)
    nextTick(() => resumeAutoUpdater())
  }

  return {
    response,
    makeForm,
    makeFormFinder: resourceFinder,
    validationErrors,
    form,
    updating,
    update,
    record,
    activeRequests,
    standardErrors,
    makingForm,
    cancel,
    ModelClass,
    repo,
    composableId,
  }
}