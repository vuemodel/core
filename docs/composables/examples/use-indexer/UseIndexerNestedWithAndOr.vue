<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

const usersIndexer = useIndexer(User, {
  with: {
    posts: {
      or: [
        {
          created_at: { greaterThan: '2023-09-01' },
          title: { equals: 'qui est esse' },
        },
      ],
    },
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
      class="q-mb-sm"
      @click="usersIndexer.index()"
    />

    <pre
      v-if="usersIndexer.records.value.length"
      style="max-height: 400px"
    >{{ usersIndexer.records.value }}</pre>
  </div>
</template>
