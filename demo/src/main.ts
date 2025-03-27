import { createApp } from 'vue'
import { Quasar, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import { createVueModel, useModelDriver } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/indexeddb'

import App from './App.vue'
import router from './router'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const pinia = createPinia()

const vueModel = createVueModel({
  default: 'local',
  config: {
    optimistic: true,
  },
  drivers: {
    local: {
      driver: {
        ...piniaLocalVueModelDriver,
        useModel: useModelDriver,
      },
      config: {
        optimistic: true,
        pinia,
        notifyOnError: {
          bulkUpdate: true,
        },
        errorNotifiers: {
          bulkUpdate () {
            console.log('bulk update error notifier!')
          },
        },
      },
    },
  },
})

const piniaLocalStorage = createPiniaLocalStorage({
  frontStore: pinia,
  // mockStandardErrors: [{
  //   message: 'sdfg',
  //   name: 'sgfsf'
  // }],
})

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vueModel)
app.use(piniaLocalStorage)
app.use(Quasar, {
  plugins: { Dialog }, // import Quasar plugins and add here
})

app.mount('#app')
