import { createApp } from 'vue'
import { Quasar, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import { createVueModel, useModelDriver } from '@vuemodel/core'
import { createIndexedDb, indexedDbVueModelDriver } from '@vuemodel/indexeddb'

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
        ...indexedDbVueModelDriver,
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

const indexedDbStorage = createIndexedDb({
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
app.use(indexedDbStorage)
app.use(Quasar, {
  plugins: { Dialog }, // import Quasar plugins and add here
})

app.mount('#app')
