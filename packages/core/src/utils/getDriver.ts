import { toValue } from 'vue'
import { vueModelState } from '../plugin/state'

export function getDriver (driverKeyParam?: string) {
  const driverKey = driverKeyParam ?? vueModelState.default ?? 'default'

  const driver = vueModelState.drivers[toValue(driverKey)]

  if (!driver) {
    throw new Error(`driver "${driverKey}" not found`)
  }

  return driver
}
