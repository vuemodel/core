<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const PostIndexer = useIndexer(Post, { immediate: true })
</script>

<template>
  <div class="q-pa-md">
    <pre
      v-if="PostIndexer.records.value.length"
      style="max-height: 400px"
    >{{ PostIndexer.records.value }}</pre>
  </div>
</template>
