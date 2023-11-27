<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

const usersIndexer = useIndexer(User, {
  filters: {
    name: { equals: 'Chelsey Dietrich' },
  },
})
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Search"
      color="primary"
      unelevated
      :loading="usersIndexer.indexing.value"
      class="q-mb-md"
      @click="usersIndexer.index()"
    />

    <HighlightedCode
      v-if="usersIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(usersIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
