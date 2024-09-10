<script lang="ts" setup>
import { sync } from '@vuemodel/core'
import { Photo, populateRecords } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { ref } from 'vue'

const response = ref()

async function resetData () {
  await clear()
  await populateRecords('photos')
  await populateRecords('photo_tags')
  await populateRecords('tags')
}

async function syncTags () {
  response.value = (await sync(Photo, '1', 'tags', [1, 2, 3]))
}
</script>

<template>
  <div>
    <button @click="resetData()">
      Reset Data
    </button>
    <button @click="syncTags()">
      Sync
    </button>

    <pre>{{ response }}</pre>
  </div>
</template>
