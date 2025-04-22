import { useIndexer } from '@vuemodel/core'
import { Album, populateRecords } from '@vuemodel/sample-data'
import { defineStore } from 'pinia'

export const useAlbumsIndexer = defineStore('albums-indexer', () => {
  const indexer = useIndexer(Album)
  populateRecords('albums', 3).then(() => {
    indexer.index()
  })

  return indexer
})
