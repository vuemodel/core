import { VueModelConfig, vueModelState } from '../plugin/state'

export function getBaseConfig (): VueModelConfig {
  return vueModelState.config ?? {}
}
