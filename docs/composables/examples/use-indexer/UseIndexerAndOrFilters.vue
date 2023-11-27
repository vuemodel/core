<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(Post, {
  filters: {
    body: {
      contains: 'est',
    },
    or: [
      {
        created_at: {
          greaterThan: '2023-08-02',
        },
      },
      {
        user_id: {
          equals: '1',
        },
      },
    ],
  },
})
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-sm"
      @click="postsIndexer.index()"
    />

    <HighlightedCode
      v-if="postsIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(postsIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
