<script lang="ts" setup>
import { mdiDatabaseRefreshOutline } from '@quasar/extras/mdi-v7'
import { clear } from 'idb-keyval'

function refreshPage() {
  self.location.reload()
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
      @click.stop.prevent="async () => {
        await clear()
        refreshPage()
      }"
    />
  </div>
</template>
