<script lang="ts" setup>
import { mdiDatabaseRefreshOutline } from '@quasar/extras/mdi-v7'
import { deleteDatabases } from '@vuemodel/indexeddb'
import { populateRecords } from '@vuemodel/sample-data'
import { ref } from 'vue'

const resetting = ref(false)

async function resetData () {
  resetting.value = true
  await deleteDatabases()
  await Promise.all([
    populateRecords('albums'),
    populateRecords('comments', 50),
    populateRecords('photos', 20),
    populateRecords('posts', 40),
    populateRecords('users'),
    populateRecords('photo_tags'),
    populateRecords('dataverse_users'),
  ])

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
      await resetData()
    }"
  >
    <q-tooltip>
      Reset Sample Data
    </q-tooltip>
  </q-btn>
</template>
