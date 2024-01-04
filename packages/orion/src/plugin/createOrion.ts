import { Plugin } from 'vue'
import { OrionDriverOptions, orionState } from './state'

export const createOrion = (
  options: OrionDriverOptions,
): Plugin => {
  return {
    install () {
      if (!options.name) {
        throw new Error('"name" option is required')
      }
      orionState[options.name] = {
        createWretch: options.createWretch,
        store: options.store,
        name: options.name,
      }
    },
  }
}
