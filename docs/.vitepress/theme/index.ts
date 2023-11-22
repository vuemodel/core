import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { inBrowser } from 'vitepress'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './styles.css'
import { createVueModel } from '@vuemodel/core'
import { createPinia } from 'pinia'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { createORM } from 'pinia-orm'
import ExamplePanel from '../../components/ExamplePanel/ExamplePanel.vue'
import { setCDN } from 'shiki'
import ResetDataButton from './ResetDataButton.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-after': () => h(ResetDataButton)
    })
  },
  enhanceApp: async (ctx) => {
    if(!inBrowser) {
      await import('fake-indexeddb/auto')
    }

    setCDN('https://cdn.jsdelivr.net/npm/shiki')
    
    const piniaOrm = createORM()
    const piniaFront = createPinia()
    const piniaBack = createPinia()
  
    piniaFront.use(piniaOrm)
    const piniaLocalStorage = createPiniaLocalStorage({
      frontStore: piniaFront,
      backStore: piniaBack,
    })
    const vueModel = createVueModel({
      default: 'local',
      drivers: {
        local: {
          implementation: piniaLocalVueModelDriver,
          config: { pinia: piniaFront }
        }
      },
    })
  
    ctx.app.use(piniaFront)
    ctx.app.use(vueModel)
    ctx.app.use(piniaLocalStorage)
    ctx.app.use(piniaOrm)
    ctx.app.component('ExamplePanel', ExamplePanel)

    ctx.app.use(Quasar, {
      config: {
        brand: {
          primary: '#007ea7',
          secondary: '#003459',
          accent: '#00171f'
        },
      }
    }, { req: { headers: {} } });
  }
}