import { Model } from 'pinia-orm'
import { IndexResources } from './crud/index/IndexResources'
import { UseIndexResources } from './crud/index/UseIndexResources'
import { CreateResource } from './crud/create/CreateResource'
import { UseCreateResource } from './crud/create/UseCreateResource'
import { UpdateResource } from './crud/update/UpdateResource'
import { FindResource } from './crud/find/FindResource'
import { RemoveResource } from './crud/remove/RemoveResource'
import { UseUpdateResource } from './crud/update/UseUpdateResource'
import { UseFindResource } from './crud/find/UseFindResource'
import { UseRemoveResource } from './crud/remove/UseRemoveResource'
import { VueModelConfig } from '../plugin/state'

export interface VueModelDriverImplementation<T extends typeof Model> {
  createResource: CreateResource<T>
  useCreateResource: UseCreateResource<T>

  indexResources: IndexResources<T>
  useIndexResources: UseIndexResources<T>

  updateResource: UpdateResource<T>
  useUpdateResource: UseUpdateResource<T>

  findResource: FindResource<T>
  useFindResource: UseFindResource<T>

  removeResource: RemoveResource<T>
  useRemoveResource: UseRemoveResource<T>
}

/**
 * Interface/Contract for a VueModel driver
 */
export type VueModelDriver<T extends typeof Model = typeof Model> = {
  config?: VueModelConfig
} & VueModelDriverImplementation<T>
