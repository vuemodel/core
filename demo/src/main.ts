import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'

import App from './App.vue'
import router from './router'

const pinia = createPinia()

const vueModel = createVueModel({
  default: 'local',
  config: {
    optimistic: true,
  },
  drivers: {
    local: {
      implementation: piniaLocalVueModelDriver,
      config: {
        optimistic: true,
      },
    },
  },
})

const piniaLocalStorage = createPiniaLocalStorage({
  frontStore: pinia,
})

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vueModel)
app.use(piniaLocalStorage)

app.mount('#app')
