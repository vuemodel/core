// @ts-nocheck
import { createVueModel } from "@vuemodel/core";
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'

export const vueModel = createVueModel({
  default: 'local',
  drivers: {
    local: piniaLocalVueModelDriver,
  }
})

export const piniaLocalStorage = createPiniaLocalStorage()