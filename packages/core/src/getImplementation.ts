import { Model } from 'pinia-orm'
import { VueModelDriverImplementation } from './contracts/VueModelDriver'
import { vueModelState } from './plugin/state'
import { toValue } from 'vue'

export function getImplementation<T extends typeof Model, K extends keyof VueModelDriverImplementation<T>> (
  key: K,
  driver?: string,
): VueModelDriverImplementation<T>[K] {
  let implementation: VueModelDriverImplementation<T>[K]

  if (driver) {
    implementation = vueModelState.drivers[driver]?.implementation[key]
  } else if (!vueModelState.default) {
    const firstDriverKey = Object.keys(vueModelState.drivers)[0]
    if (!firstDriverKey) {
      throw new Error(`could not find implementation for "${key}". No drivers installed.`)
    }

    implementation = vueModelState.drivers[firstDriverKey].implementation[key]
  } else {
    implementation = vueModelState.drivers[toValue(vueModelState.default)].implementation[key]
  }

  if (!implementation) {
    throw new Error(`could not discover implementation for "${key}". No driver installed.`)
  }

  return implementation
}
