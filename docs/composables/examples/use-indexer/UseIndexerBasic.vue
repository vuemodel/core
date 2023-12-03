<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(Post)
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-md"
      @click="postsIndexer.index()"
    />

    <pre
      v-if="postsIndexer.records.value.length"
      style="max-height: 400px"
    >{{ postsIndexer.records.value }}</pre>
  </div>
</template>
