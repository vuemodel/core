import {
  VueModelDriver,
  useCreateResourceImplementation,
  useIndexResourcesImplementation,
  useFindResourceImplementation,
} from '@vuemodel/core'

import { indexResources } from './implementations/index/indexResources'

import { createResource } from './implementations/create/createResource'

import { findResource } from './implementations/find/findResource'

import { removeResource } from './implementations/remove/removeResource'
import { useRemoveResource } from './implementations/remove/useRemoveResource'

import { updateResource } from './implementations/update/updateResource'
import { useUpdateResource } from './implementations/update/useUpdateResource'

export const piniaLocalVueModelDriver: VueModelDriver = {
  indexResources,
  useIndexResources: useIndexResourcesImplementation,

  createResource,
  useCreateResource: useCreateResourceImplementation,

  updateResource,
  useUpdateResource,

  findResource,
  useFindResource: useFindResourceImplementation,

  removeResource,
  useRemoveResource,
}

export { createPiniaLocalStorage } from './plugin/createPiniaLocalStorage'
export * from './plugin/state'
