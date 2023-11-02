import { vueModelState } from '../plugin/state'

export function getDriver (driverKey?: string) {
  driverKey = driverKey ?? vueModelState.default ?? 'default'

  const driver = vueModelState.drivers[driverKey]

  if (!driver) {
    throw new Error(`driver "${driverKey}" not found`)
  }

  return driver
}
