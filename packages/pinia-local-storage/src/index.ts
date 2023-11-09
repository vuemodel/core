import {
  VueModelDriver,
  useCreateResourceImplementation,
  useUpdateResourceImplementation,
  useIndexResourcesImplementation,
  useFindResourceImplementation,
  useRemoveResourceImplementation,
} from '@vuemodel/core'

import { indexResources } from './implementations/index/indexResources'
import { createResource } from './implementations/create/createResource'
import { findResource } from './implementations/find/findResource'
import { removeResource } from './implementations/remove/removeResource'
import { updateResource } from './implementations/update/updateResource'

export const piniaLocalVueModelDriver: VueModelDriver = {
  indexResources,
  useIndexResources: useIndexResourcesImplementation,

  createResource,
  useCreateResource: useCreateResourceImplementation,

  updateResource,
  useUpdateResource: useUpdateResourceImplementation,

  findResource,
  useFindResource: useFindResourceImplementation,

  removeResource,
  useRemoveResource: useRemoveResourceImplementation,
}

export { createPiniaLocalStorage } from './plugin/createPiniaLocalStorage'
export * from './plugin/state'
