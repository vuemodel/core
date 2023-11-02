import { VueModelConfig } from '../plugin/state'
import { getBaseConfig } from './getBaseConfig'
import { deepmerge } from 'deepmerge-ts'
import { getRawDriverConfig } from './getRawDriverConfig'

export function getMergedDriverConfig (driverKey?: string): VueModelConfig {
  const baseConfig = getBaseConfig()
  const driverConfig = getRawDriverConfig(driverKey)

  return deepmerge(baseConfig, driverConfig)
}
