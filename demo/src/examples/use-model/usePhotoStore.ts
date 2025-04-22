import { useModel } from '@vuemodel/core'
import { Photo } from '@vuemodel/sample-data'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const usePhotoStore = defineStore('photo', () => {
  const autoUpdate = useLocalStorage('useModel:autoUpdate', false)

  return {
    ...useModel(Photo, {
      optimistic: true,
      update: {
        autoUpdate,
      },
      index: {
        paginateImmediate: true,
        with: {
          tags: {},
          album: {},
        },
      },
    }),
    autoUpdate,
  }
})
