import { toValue } from 'vue'
import { vueModelState } from '../plugin/state'

export function getDriverKey (key?: string): string {
  return key ?? toValue(vueModelState.default) ?? 'default'
}
