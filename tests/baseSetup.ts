import { createVueModel } from '@vuemodel/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import {
  piniaLocalStorageState,
  createPiniaLocalStorage,
  piniaLocalVueModelDriver,
} from '@vuemodel/pinia-local-storage'
import { clear as clearStorage } from 'localforage'

export async function baseSetup () {
  const clearStoragePromise = clearStorage()
  piniaLocalStorageState.mockStandardErrors = undefined
  piniaLocalStorageState.mockValidationErrors = undefined
  const app = createApp({})

  const pinia = createPinia()
  const piniaLocalStorage = createPiniaLocalStorage({ frontStore: pinia })
  const vueModel = createVueModel({
    default: 'local',
    drivers: { local: piniaLocalVueModelDriver },
  })

  app.use(pinia)
  app.use(vueModel)
  app.use(piniaLocalStorage)

  await clearStoragePromise
}
