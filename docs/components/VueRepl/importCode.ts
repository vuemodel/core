import { createVueModel, create, find } from '@vuemodel/core'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import { piniaLocalStorageState, createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/indexeddb'
import { createORM, useRepo } from 'pinia-orm'
import { exampleDataMap } from '@vuemodel/sample-data'
