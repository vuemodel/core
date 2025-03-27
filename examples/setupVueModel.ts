import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/indexeddb'
import { createPinia } from 'pinia'
import 'fake-indexeddb/auto' // node doesn't have indexeddb, so we fake it for this example

export function setupVueModel () {
  const pinia = createPinia()
  createPiniaLocalStorage({ frontStore: pinia })

  createVueModel({
    default: 'local',
    drivers: {
      local: {
        driver: piniaLocalVueModelDriver,
        config: { pinia },
      },
    },
  })
}
