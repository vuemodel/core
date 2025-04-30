<script lang="ts">
import { Album, Photo, populateRecords, Tag } from '@vuemodel/sample-data'
import { defineStore } from 'pinia'
import CreatePhotoCard from './CreatePhotoCard.vue'
import PhotosTable from './PhotosTable.vue'
import UpdatePhotoDialog from './UpdatePhotoDialog.vue'
import { useIndexer, useModel } from '@vuemodel/core'
import { useLocalStorage } from '@vueuse/core'

export const useAlbumsIndexer = defineStore('albums-indexer', () => {
  const indexer = useIndexer(Album)
  populateRecords('albums', 3).then(() => {
    indexer.index()
  })

  return indexer
})

export const useTagsIndexer = defineStore('tags-indexer', () => {
  const indexer = useIndexer(Tag)
  populateRecords('tags').then(() => {
    indexer.index()
  })

  return indexer
})

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
</script>

<script lang="ts" setup>
import CreateDialog from './CreateDialog.vue'

</script>

<template>
  <div class="row q-pa-lg q-gutter-lg">
    <PhotosTable />

    <CreatePhotoCard />
  </div>

  <UpdatePhotoDialog />

  <CreateDialog />
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
