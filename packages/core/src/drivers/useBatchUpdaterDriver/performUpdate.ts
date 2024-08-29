import { toValue } from 'vue'
import { UseBatchUpdaterOptions, UseBatchUpdaterReturn, UseBatchUpdateUpdateOptions } from '../../contracts/batch-update/UseBatchUpdater'
import { BatchUpdateResponse, BatchUpdateErrorResponse } from '../../types/Response'
import { getDriverKey } from '../../utils/getDriverKey'
import { batchUpdate as batchUpdateRecords } from '../../actions/batchUpdate'
import { Model } from 'pinia-orm'
import { generateRandomString } from '../../utils/generateRandomString'
import { useFormMaker } from './useFormMaker'
import { getFormsChangedValues } from './getFormsChangedValues'
import clone from 'just-clone'

export async function performUpdate<
  T extends typeof Model,
  R extends UseBatchUpdaterReturn<T>
> (
  optionsParam: UseBatchUpdateUpdateOptions<T>,
  composableOptions: {
    response: R['response']
    options: UseBatchUpdaterOptions<T> | undefined
    ModelClass: T
    changes: R['changes']
    meta: R['meta']
    activeRequest: R['activeRequest']
    activeRequests: R['activeRequests']
    updating: R['updating']
    repo: R['repo']
    forms: R['forms']
    formMaker: ReturnType<typeof useFormMaker>
  },
): Promise<BatchUpdateResponse<T>> {
  const {
    response,
    options,
    ModelClass,
    changes,
    meta,
    activeRequest,
    activeRequests,
    updating,
    forms,
    repo,
    formMaker,
  } = composableOptions

  const missingPremadeFormIds: string[] = []
  if (optionsParam.forms) {
    Object.keys(optionsParam.forms).forEach(recordId => {
      if (!forms.value[recordId]) {
        missingPremadeFormIds.push(recordId)
      }
    })
  }

  if (missingPremadeFormIds.length) {
    await formMaker.makeForms(missingPremadeFormIds)
  }

  if (optionsParam.forms) {
    Object.entries(optionsParam.forms).forEach(([formId, form]) => {
      const changedValues = getFormsChangedValues({ id: formId, newValues: form, repo })
      if (!changes.value[formId]) { changes.value[formId] = {} }
      Object.assign(changes.value[formId], changedValues)
      Object.assign(forms.value[formId], form)
    })
  }

  response.value = undefined

  const persist = !!toValue(options?.persist)

  const controller = new AbortController()
  const signal = controller.signal

  const request = batchUpdateRecords?.(
    ModelClass,
    clone(changes.value),
    {
      driver: getDriverKey(options?.driver),
      notifyOnError: !!options?.notifyOnError,
      signal,
      throw: false,
    },
  ) as Promise<BatchUpdateResponse<T>> & { cancel(): void }

  const fieldNewValueMap = new Map()

  const changedRecordMetas = Object.entries(changes.value).map(changeEntry => {
    const recordMeta = meta.value[changeEntry[0]]
    recordMeta.updating = true
    return recordMeta
  })

  const fields = Object.entries(changes.value).flatMap(changeEntry => {
    const id = changeEntry[0]
    const changeForm = changeEntry[1]
    meta.value[id].updating = true
    return Object.keys(changeForm).map(fieldKey => {
    /* @ts-expect-error hard to type, no benefit */
      const field = meta.value[id].fields[fieldKey]
      field.updating = true
      /* @ts-expect-error hard to type, no benefit */
      fieldNewValueMap.set(field, changeForm[fieldKey])
      return field
    })
  })

  request.cancel = () => {
    controller.abort()
  }

  const requestId = generateRandomString(5)

  activeRequest.value = { forms: forms.value, request }
  activeRequests.value[requestId] = activeRequest.value

  updating.value = true

  const thisResponse = await request

  updating.value = false

  activeRequest.value = undefined
  response.value = thisResponse

  fields.forEach(field => {
    field.updating = false
    field.changed = false
    field.initialValue = fieldNewValueMap.get(field)
  })
  changedRecordMetas.forEach(recordMeta => {
    recordMeta.updating = false
    recordMeta.changed = false
  })

  // Persisting to the store
  if (persist) {
    repo.save(thisResponse?.records ?? [])
  }

  // On Success
  if (thisResponse?.success) {
    changes.value = {}
    options?.onSuccess?.(thisResponse)
  }

  // On validation error
  if (thisResponse.validationErrors) {
    options?.onValidationError?.(thisResponse as BatchUpdateErrorResponse<T>)
  }

  // On standard error
  if (thisResponse.standardErrors) {
    options?.onStandardError?.(thisResponse)
  }

  // On Error
  if (thisResponse.validationErrors || thisResponse.standardErrors) {
    options?.onError?.(thisResponse as BatchUpdateErrorResponse<T>)
  }
  delete activeRequests.value[requestId]

  return thisResponse
}
