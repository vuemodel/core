import { FormValidationErrors, QueryValidationErrors, StandardErrors } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { piniaLocalStorageSetups } from './piniaLocalStorageSetups'

export interface ImplementationSetups {
  setMockLatency: (ms: number) => Promise<void>
  setMockValidationErrors: (
    validationErrors: FormValidationErrors<typeof Model> | QueryValidationErrors
  ) => Promise<void>
  setMockStandardErrors: (
    standardErrors: StandardErrors
  ) => Promise<void>
  baseSetup: () => Promise<void>
  populateRecords: (entityName: string, numberOfRecords: number) => Promise<void>
}

export const implementationSetupsMap: Record<string, ImplementationSetups> = {
  piniaLocalStorage: piniaLocalStorageSetups,
}
