import { Plugin } from 'vue'
import { piniaLocalStorageState } from './state'
import { createPinia } from 'pinia'
import { Database } from 'pinia-orm'
import { CreatePiniaLocalStorageOptions } from './CreatePiniaLocalStorageOptions'

export const createPiniaLocalStorage = (options: CreatePiniaLocalStorageOptions): Plugin => {
  return {
    install () {
      piniaLocalStorageState.frontStore = options?.frontStore
      piniaLocalStorageState.store = options?.backStore ?? createPinia()
      piniaLocalStorageState.database = new Database()
      piniaLocalStorageState.mockLatencyMs = options?.mockLatencyMs ?? 0
      piniaLocalStorageState.mockStandardErrors = options?.mockStandardErrors
      piniaLocalStorageState.mockValidationErrors = options?.mockValidationErrors
    },
  }
}
