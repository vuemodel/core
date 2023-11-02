import { UpdateResourceResponse, UseUpdateResourceOptions, UseUpdateResourceReturn, vueModelState } from "@vuemodel/core"
import { ValidationErrors } from "@vuemodel/core/src/contracts/errors/ValidationErrors"
import { getItem } from 'localforage'
import { Model, useRepo } from 'pinia-orm'
import { Ref, computed, ref } from "vue"
import { DeclassifyPiniaOrmModel, PiniaOrmForm } from "pinia-orm-helpers"
import { piniaLocalStorageState } from "../../plugin/state"
import { StandardErrors } from "@vuemodel/core/src/contracts/errors/StandardErrors"

const defaultOptions = {
  persist: true
}

export function useUpdateResource<T extends typeof Model>(
  model: T,
  options?: UseUpdateResourceOptions<InstanceType<T>> & { driver?: string }
): UseUpdateResourceReturn<InstanceType<T>> {
  options = Object.assign({}, defaultOptions, options)

  const form = ref(options.form) as Ref<PiniaOrmForm<InstanceType<T>>>

  const response = ref<UpdateResourceResponse<InstanceType<T>>>()
  const updating: UseUpdateResourceReturn<InstanceType<T>>['updating'] = ref(false)
  const validationErrors: UseUpdateResourceReturn<InstanceType<T>>['validationErrors'] = computed(() => {
    return {} as ValidationErrors<InstanceType<T>>
  })
  const standardErrors: UseUpdateResourceReturn<InstanceType<T>>['standardErrors'] = computed(() => {
    return [] as StandardErrors
  })

  if (!piniaLocalStorageState.store) {
    throw 'Pinia store not instantiated. Ensure the "pinia-local-storage" plugin is installed'
  }

  const backendRepo = useRepo(model, piniaLocalStorageState.store)
  const driver = options?.driver ?? vueModelState.default ?? Object.keys(vueModelState.drivers)[0]
  if(!driver) throw new Error('Could not discover "update" driver. Is one installed?')

  const updateResource = vueModelState.drivers[driver].updateResource
  const repo = useRepo(model)

  const data = computed(() => {
    return response.value?.data
  })

  async function update() {
    console.log('Update the resource!')
    const data = await getItem<DeclassifyPiniaOrmModel<InstanceType<T>>[]>(model.entity)
    if (!data) {
      response.value.data = []
      repo.flush()
      return
    }

    // const query = backendRepo.query()
    // Object.entries((toValue(options.filters) ?? {}) as UpdateResourceFilters<InstanceType<T>>)
    //   .forEach(([field, filter]) => {
    //     getClassFields(model)
    //     if (field === '')
    //   })

    // if (options.persist) {

    // }
  }

  return {
    standardErrors,
    response,
    validationErrors,
    form,
    updating,
    update,
    data
  }
}