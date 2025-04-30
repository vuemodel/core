import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import { QBtn, QDialog, QTab, QTabPanel, QTabPanels, QTabs, Quasar, ClosePopup, QCard, QCardSection, QToolbar, QToolbarTitle, QSelect, QInput, QCheckbox, QTooltip, QForm, QIcon, QPagination, QSpinner, QList, QItem, QItemSection, QBanner } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './styles.css'
import { createVueModel } from '@vuemodel/core'
import { createPinia } from 'pinia'
import { createIndexedDb, indexedDbVueModelDriver, indexedDbState } from '@vuemodel/indexeddb'
import { createORM } from 'pinia-orm'
import ExamplePanel from '../../components/ExamplePanel/ExamplePanel.vue'
import { Notify } from 'quasar'
import HighlightedCode from '../../components/HighlightedCode/HighlightedCode.vue'

export default {
  extends: DefaultTheme,
  enhanceApp: async (ctx) => {
    if(!inBrowser) {
      await import('fake-indexeddb/auto')
    }
    
    const piniaOrm = createORM()
    const piniaFront = createPinia()
    const piniaBack = createPinia()
  
    piniaFront.use(piniaOrm)
    const indexedDb = createIndexedDb({
      frontStore: piniaFront,
      backStore: piniaBack,
    })
    
    const vueModel = createVueModel({
      default: 'local',
      drivers: {
        local: {
          driver: indexedDbVueModelDriver,
          config: { pinia: piniaFront }
        }
      },
    })
  
    ctx.app.use(piniaFront)
    ctx.app.use(vueModel)
    ctx.app.use(indexedDb)
    ctx.app.use(piniaOrm)

    ctx.app.component('QBtn', QBtn)
    ctx.app.component('QTab', QTab)
    ctx.app.component('QTabs', QTabs)
    ctx.app.component('QTabPanel', QTabPanel)
    ctx.app.component('QTabPanels', QTabPanels)
    ctx.app.component('QDialog', QDialog)
    ctx.app.component('QCard', QCard)
    ctx.app.component('QCardSection', QCardSection)
    ctx.app.component('QToolbar', QToolbar)
    ctx.app.component('QToolbarTitle', QToolbarTitle)
    ctx.app.component('QCheckbox', QCheckbox)
    ctx.app.component('QInput', QInput)
    ctx.app.component('QSelect', QSelect)
    ctx.app.component('QTooltip', QTooltip)
    ctx.app.component('QForm', QForm)
    ctx.app.component('QPagination', QPagination)
    ctx.app.component('QIcon', QIcon)
    ctx.app.component('QSpinner', QSpinner)
    ctx.app.component('QList', QList)
    ctx.app.component('QItem', QItem)
    ctx.app.component('QItemSection', QItemSection)
    ctx.app.component('QBanner', QBanner)

    ctx.app.directive('close-popup', ClosePopup)

    ctx.app.component('ExamplePanel', ExamplePanel)
    ctx.app.component('HighlightedCode', HighlightedCode)

    ctx.app.use(Quasar, {
      plugins: {
        Notify
      },
      config: {
        brand: {
          primary: '#007ea7',
          secondary: '#003459',
          accent: '#00171f'
        },
      }
    }, { req: { headers: {} } })
    
    indexedDbState.mockLatencyMs = 300
  }
}