<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(Post, {
  with: {
    comments: {},
    user: {},
  },
})

// or

// const postsIndexer = useIndexer(Post, {
//   with: ['comments', 'user']
// })
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Search"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-md"
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
