import { FormValidationErrors, UpdateResourceOptions, UpdateResponse, getMergedDriverConfig } from '@vuemodel/core'
import { Model, useRepo } from 'pinia-orm'
import { get as getItem, set as setItem } from 'idb-keyval'
import { PiniaOrmForm, getClassAttributes } from 'pinia-orm-helpers'
import { pick } from '../../utils/pick'
import { piniaLocalStorageState } from '../../plugin/state'
import { wait } from '../../utils/wait'
import { makeMockErrorResponse } from '../../utils/makeMockErrorResponse'

export async function updateResource<T extends typeof Model> (
  EntityClass: T,
  id: string,
  form: PiniaOrmForm<InstanceType<T>>,
  options: UpdateResourceOptions = {},
): Promise<UpdateResponse<T>> {
  const config = getMergedDriverConfig(options?.driver)
  const notifyOnError = 'notifyOnError' in options ? options.notifyOnError : config?.notifyOnError?.update

  const mockErrorResponse = makeMockErrorResponse<T, UpdateResponse<T>>({
    config,
    EntityClass,
    notifyOnError,
    includeValidationErrors: true,
    errorNotifierFunctionKey: 'update',
  })
  if (mockErrorResponse !== false) return mockErrorResponse

  const recordsKey = `${EntityClass.entity}.records`
  const records = (await getItem<Record<string, InstanceType<T>>>(recordsKey)) ?? {}

  const recordForUpdate = records?.[id]

  if (!recordForUpdate) {
    return {
      record: undefined,
      standardErrors: [{ message: `record with id ${id} not found`, name: 'Not Found' }],
      success: false,
      action: 'update',
      validationErrors: {} as FormValidationErrors<T>,
    }
  }

  const recordClone = structuredClone(recordForUpdate)
  const attributes = getClassAttributes(EntityClass)
  const updatedRecord = Object.assign({}, recordClone, pick(form, Object.keys(attributes)))

  records[id] = updatedRecord

  await setItem(`${EntityClass.entity}.records`, records)
  await wait(piniaLocalStorageState.mockLatencyMs ?? 0)

  const result: UpdateResponse<T> = {
    record: updatedRecord,
    action: 'update',
    standardErrors: undefined,
    validationErrors: undefined,
    success: true,
  }

  return result
}
