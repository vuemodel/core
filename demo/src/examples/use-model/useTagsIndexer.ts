import { useIndexer } from '@vuemodel/core'
import { populateRecords, Tag } from '@vuemodel/sample-data'
import { defineStore } from 'pinia'

export const useTagsIndexer = defineStore('tags-indexer', () => {
  const indexer = useIndexer(Tag)
  populateRecords('tags').then(() => {
    indexer.index()
  })

  return indexer
})
