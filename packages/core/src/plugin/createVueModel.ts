import { Plugin } from 'vue'
import { VueModelState, vueModelState } from './state'

export function createVueModel (options: VueModelState): Plugin {
  vueModelState.default = options?.default ?? 'default'
  vueModelState.config = options.config ?? {}
  Object.assign(vueModelState.drivers, options?.drivers ?? {})

  /**
   * In the future we'll likely add features that utilize "install". To prevent breaking
   * changes when adding these features, we get devs to install the plugin so that the
   * install section is already being run. This is still technically a breaking
   * change, but far less likely to casue problems.
   */
  return {
    install () {
      return ({})
    },
  }
}
