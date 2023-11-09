import { Model, useRepo } from 'pinia-orm'
import { Ref, computed, ref, toValue, watch } from 'vue'
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from 'pinia-orm-helpers'
import { UseUpdateResourceOptions, UseUpdateResourceReturn } from '../contracts/crud/update/UseUpdateResource'
import { getImplementation } from '../getImplementation'
import { UpdateResponse } from '../types/ResourceResponse'
import { FormValidationErrors } from '../contracts/errors/FormValidationErrors'
import { StandardErrors } from '../contracts/errors/StandardErrors'
import { pick } from '../utils/pick'
import { Constructor } from '../types/Constructor'
import { populateFormWithRecord } from '../utils/populateFormWithRecord'
import { getMergedDriverConfig } from '../utils/getMergedDriverConfig'
import debounce from '../utils/debounce'

const defaultOptions = {
  persist: true,
}

export function useUpdateResourceImplementation<T extends typeof Model> (
  EntityClass: T,
  options?: UseUpdateResourceOptions<T>,
): UseUpdateResourceReturn<T> {
  options = Object.assign({}, defaultOptions, options)
  const updateResource = getImplementation<T, 'updateResource'>('updateResource', options.driver)
  const useFindResource = getImplementation<T, 'useFindResource'>('useFindResource', options.driver)

  const resourceFinder = useFindResource(EntityClass)

  const driverConfig = getMergedDriverConfig(options.driver)
  const repo = useRepo<InstanceType<T>>(
    EntityClass as unknown as Constructor<InstanceType<T>>,
    driverConfig.pinia,
  )

  const form = ref(options.form ?? {}) as Ref<PiniaOrmForm<InstanceType<T>>>

  const activeRequests = ref<UseUpdateResourceReturn<T>['activeRequests']>({} as UseUpdateResourceReturn<T>['activeRequests'])

  const response = ref<UpdateResponse<T>>()

  const updating = ref<string | number | string[] | number[]>()
  const makingForm = ref<string | number | string[] | number[]>()

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

  function discoverIdAndFormFromParams (
    idOrFormParam?: PiniaOrmForm<InstanceType<T>> | string | number,
    formParam?: PiniaOrmForm<InstanceType<T>>,
  ) {
    if (typeof idOrFormParam === 'string' || typeof idOrFormParam === 'number') {
      // First api signature (only id)
      if (!formParam) {
        return {
          form: {},
          id: idOrFormParam,
        }
      } else {
        // Second api signature (id and form)
        return {
          form: formParam,
          id: idOrFormParam,
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
    const id = targetId ?? toValue(options?.id)
    if (!id) return {}
    const foundRecord = repo.find(String(id))
    if (!foundRecord) {
      makingForm.value = id
      try {
        await resourceFinder.find(String(id))
        const foundRecord = repo.find(String(id))
        if (foundRecord) {
          populateFormWithRecord(foundRecord, form)
        }
      } catch (error) {
        console.error(
          `request failed for entity "${EntityClass.entity}", id "${id}", when attempting to populate form with record.`,
          error,
        )
      }
      makingForm.value = undefined
    } else {
      populateFormWithRecord(foundRecord, form)
    }

    return form.value
  }

  async function update (
    idOrFormParam?: PiniaOrmForm<InstanceType<T>> | string | number,
    formParam?: PiniaOrmForm<InstanceType<T>>,
  ) {
    response.value = undefined
    optimisticRecord.value = undefined

    const {
      form: resolvedFormParam,
      id: resolvedIdParam,
    } = discoverIdAndFormFromParams(idOrFormParam, formParam)

    const primaryKey = String(EntityClass.primaryKey)
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

    const resolvedId = getRecordId(mergedForm)
    if (!resolvedId) {
      response.value = {
        action: 'update',
        record: undefined,
        standardErrors: [{ message: '', name: 'no id' }],
        success: false,
        validationErrors: {} as FormValidationErrors<T>,
      }
      return
    }

    const persist = !!toValue(options?.persist)
    const optimistic = !!toValue(options?.optimistic) && persist

    const originalRecord = structuredClone(repo.find(resolvedId))

    let thisOptimisticRecord: InstanceType<T> | undefined
    if (optimistic && persist) {
      repo.destroy(resolvedId)
      thisOptimisticRecord = repo.insert(mergedForm)
      optimisticRecord.value = thisOptimisticRecord
    } else {
      thisOptimisticRecord = undefined
    }

    updating.value = resolvedId
    const request = updateResource(
      EntityClass,
      resolvedId,
      mergedForm,
      { driver: options?.driver, notifyOnError: options?.notifyOnError },
    )

    activeRequests.value[resolvedId] = { request, form: structuredClone(mergedForm) }

    const thisResponse = await request
    response.value = thisResponse

    // Persisting to the store
    if (persist && thisResponse?.record) {
      repo.destroy(resolvedId)
      repo.insert(thisResponse?.record)
    }

    // On Success
    if (thisResponse?.success) {
      if (Object.keys(activeRequests.value).length <= 1) { form.value = {} }
      options?.onSuccess?.(thisResponse)
    }

    // On validation error
    if (thisResponse.validationErrors) {
      options?.onValidationError?.(thisResponse)
    }

    // On standard error
    if (thisResponse.standardErrors) {
      options?.onStandardError?.(thisResponse)
    }

    // On Error
    if (thisResponse.validationErrors || thisResponse.standardErrors) {
      options?.onError?.(thisResponse)
      if (optimistic && originalRecord) {
        repo.destroy(resolvedId)
        if (originalRecord) {
          repo.insert(originalRecord)
        }
      }
    }
    delete activeRequests.value[resolvedId]

    updating.value = undefined
  }

  watch(() => toValue(options?.id), () => {
    if (typeof options?.id !== 'undefined' && options.immediatelyMakeForm) {
      makeForm()
    }
  }, { immediate: true })

  const debounceMs = computed(() => {
    return toValue(options?.autoUpdateDebounce) ?? driverConfig.autoUpdateDebounce ?? 150
  })

  const updateDebounced = computed(() => {
    return debounce(update, toValue(debounceMs))
  })

  watch(form, (newForm) => {
    if (options?.autoUpdate && Object.keys(newForm).length) {
      updateDebounced.value()
    }
  }, { deep: true })

  return {
    response,
    makeForm,
    validationErrors,
    form,
    updating,
    update,
    record,
    activeRequests,
    standardErrors,
    makingForm,
    activeMakeFormRequests: resourceFinder.activeRequests,
  }
}
