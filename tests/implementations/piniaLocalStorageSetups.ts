import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { ImplementationSetups } from './implementationSetupsMap'

export const piniaLocalStorageSetups: ImplementationSetups = {
  async setMockLatency (ms: number) {
    piniaLocalStorageState.mockLatencyMs = ms
  },

  async setMockValidationErrors (mockValidationErrors) {
    piniaLocalStorageState.mockValidationErrors = mockValidationErrors
  },

  async setMockStandardErrors (mockStandardErrors) {
    piniaLocalStorageState.mockStandardErrors = mockStandardErrors
  },

  async baseSetup () {
    piniaLocalStorageState.mockStandardErrors = undefined
    piniaLocalStorageState.mockValidationErrors = undefined
    piniaLocalStorageState.mockLatencyMs = 0
  },
}
