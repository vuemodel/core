import { useModel } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const usePostStore = defineStore('post', () => {
  const autoUpdate = useLocalStorage('useModel:autoUpdate', false)

  return {
    ...useModel(Post, {
      optimistic: true,
      update: {
        pagination: { recordsPerPage: 5 },
        indexer: {
          paginateImmediate: true,
          with: {
            comments: {},
          },
        },
        autoUpdate,
      },
    }),
    autoUpdate,
  }
})
