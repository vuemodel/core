<script lang="ts" setup>
import { mdiDatabaseRefreshOutline } from '@quasar/extras/mdi-v7'
import { populateRecords } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { ref } from 'vue'

const resetting = ref(false)

function refreshPage() {
  self.location.reload()
}

async function populateAllRecords() {
  resetting.value = true
  await populateRecords('albums')
  await populateRecords('comments', 20)
  await populateRecords('photos', 20)
  await populateRecords('posts', 20)
  await populateRecords('users')
  await populateRecords('photo_tags')
  await populateRecords('dataverse_users')
  resetting.value = false
}
</script>

<template>
  <div class="full-width row">
    <q-space></q-space>
    <q-btn
      :icon="mdiDatabaseRefreshOutline"
      flat
      size="sm"
      round
      :loading="resetting"
      @click.stop.prevent="async () => {
        await clear()
        await populateAllRecords()
        refreshPage()
      }"
    />
    <q-tooltip>
      Reset Sample Data
    </q-tooltip>
  </div>
</template>
