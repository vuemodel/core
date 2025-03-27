import { Plugin } from 'vue'
import { indexedDbState } from './state'
import { createPinia } from 'pinia'
import { Database } from 'pinia-orm'
import { CreateIndexedDbOptions } from './CreateIndexedDbOptions'

export const createIndexedDb = (options: CreateIndexedDbOptions): Plugin => {
  return {
    install () {
      indexedDbState.frontStore = options?.frontStore
      indexedDbState.store = options?.backStore ?? createPinia()
      indexedDbState.database = new Database()
      indexedDbState.mockLatencyMs = options?.mockLatencyMs ?? 0
      indexedDbState.mockStandardErrors = options?.mockStandardErrors
      indexedDbState.mockValidationErrors = options?.mockValidationErrors
    },
  }
}
