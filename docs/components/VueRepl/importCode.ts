import { createVueModel, create, find, useModelDriver } from '@vuemodel/core'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import { indexedDbState, createIndexedDb, indexedDbVueModelDriver } from '@vuemodel/indexeddb'
import { createORM, useRepo } from 'pinia-orm'
import { exampleDataMap } from '@vuemodel/sample-data'
