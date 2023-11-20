import { Model } from 'pinia-orm'
import { vueModelState } from '../plugin/state'
import { toValue } from 'vue'

export function resolveParams<T extends typeof Model, O extends { driver?: string }> (
  modelOrDriver: T | string,
  optionsOrModel?: O | T,
  driverOptions?: O,
): { ModelClass: T, options: O, driver: string } {
  if (typeof modelOrDriver === 'string') {
    return {
      driver: modelOrDriver,
      ModelClass: optionsOrModel as T,
      options: driverOptions as O,
    }
  }

  return {
    ModelClass: modelOrDriver,
    options: optionsOrModel as O,
    driver: (optionsOrModel as O)?.driver ?? toValue(vueModelState?.default) ?? 'default',
  }
}
