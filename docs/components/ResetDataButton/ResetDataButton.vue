<script lang="ts" setup>
import { mdiDatabaseRefreshOutline } from '@quasar/extras/mdi-v7'
import { populateRecords } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { ref } from 'vue'

const resetting = ref(false)

async function populateAllRecords () {
  resetting.value = true
  await populateRecords('albums')
  await populateRecords('comments', 50)
  await populateRecords('photos', 20)
  await populateRecords('posts', 40)
  await populateRecords('users')
  await populateRecords('photo_tags')
  await populateRecords('dataverse_users')
  resetting.value = false
}
</script>

<template>
  <q-btn
    :icon="mdiDatabaseRefreshOutline"
    flat
    round
    :loading="resetting"
    @click.stop.prevent="async () => {
      await clear()
      await populateAllRecords()
    }"
  >
    <q-tooltip>
      Reset Sample Data
    </q-tooltip>
  </q-btn>
</template>
