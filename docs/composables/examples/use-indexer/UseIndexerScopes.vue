<script lang="ts" setup>
import { useIndexer, vueModelState } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

if (!vueModelState.config) {
  vueModelState.config = {}
}

vueModelState.config.scopes = {
  latest: {
    orderBy: [{ field: 'created_at', direction: 'descending' }],
  },
}

const postsIndexer = useIndexer(Post, { scopes: ['latest'] })
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Search"
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
