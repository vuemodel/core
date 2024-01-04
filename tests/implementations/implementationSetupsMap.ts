import { FormValidationErrors, QueryValidationErrors, StandardErrors, VueModelDriverImplementation } from '@vuemodel/core'
import { Model } from 'pinia-orm'
import { piniaLocalStorageSetups } from './piniaLocalStorageSetups'
import { orionSetups } from './orionSetups'
import { App } from 'vue'
import { Pinia } from 'pinia'
import { exampleDataMap } from '@vuemodel/sample-data'

export interface ImplementationSetups {
  implementation: VueModelDriverImplementation,

  skipIf?: () => boolean,

  setMockLatency: (ms: number) => Promise<void>

  setMockValidationErrors: (
    validationErrors: FormValidationErrors<typeof Model> | QueryValidationErrors
  ) => Promise<void>

  setMockStandardErrors: (
    standardErrors: StandardErrors
  ) => Promise<void>

  baseSetup: (
    app: App<Element>,
    context: {
      piniaFront: Pinia
    },
    testContext: any
  ) => Promise<void>

  populateRecords: (
    entityName: keyof typeof exampleDataMap,
    numberOfRecords: number
  ) => Promise<void>
}

export const implementationSetupsMap: Record<string, ImplementationSetups> = {
  piniaLocalStorage: piniaLocalStorageSetups,
  orion: orionSetups,
}
