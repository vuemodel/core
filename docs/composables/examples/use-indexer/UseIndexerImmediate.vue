<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const PostIndexer = useIndexer(Post, { immediate: true })
</script>

<template>
  <div class="q-pa-md">
    <HighlightedCode
      v-if="PostIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(PostIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
