import { VueModelConfig } from '../plugin/state'
import { getDriver } from './getDriver'

export function getRawDriverConfig (driverKey?: string): VueModelConfig {
  return getDriver(driverKey).config ?? {} as VueModelConfig
}
