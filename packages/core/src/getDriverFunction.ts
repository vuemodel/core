import { Model } from 'pinia-orm'
import { VueModelDriver } from './contracts/VueModelDriver'
import { vueModelState } from './plugin/state'
import { toValue } from 'vue'

export function getDriverFunction<T extends typeof Model, K extends keyof VueModelDriver<T>> (
  key: K,
  driverName?: string,
): VueModelDriver<T>[K] {
  let foundDriver: unknown

  if (driverName) {
    foundDriver = vueModelState.drivers[driverName]?.driver[key]
  } else if (!vueModelState.default) {
    const firstDriverKey = Object.keys(vueModelState.drivers)[0]
    if (!firstDriverKey) {
      throw new Error(`could not find driver for "${key}". No drivers installed.`)
    }

    foundDriver = vueModelState.drivers[firstDriverKey].driver[key]
  } else {
    foundDriver = vueModelState.drivers[toValue(vueModelState.default)].driver[key]
  }

  if (!foundDriver) {
    throw new Error(`could not discover driver for "${key}". No driver installed.`)
  }

  return foundDriver as VueModelDriver<T>[K]
}
