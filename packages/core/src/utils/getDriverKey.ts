import { toValue } from 'vue'
import { vueModelState } from '../plugin/state'

export function getDriverKey (key?: string) {
  return key ?? toValue(vueModelState.default) ?? 'default'
}
