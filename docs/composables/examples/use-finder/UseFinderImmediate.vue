<script lang="ts" setup>
import { useFinder } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postFinder = useFinder(Post, { id: postId, immediate: true })
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      dense
      filled
    />

    <q-btn
      label="find"
      color="primary"
      unelevated
      :loading="!!postFinder.finding.value"
      @click="postFinder.find()"
    />

    <pre
      v-if="postFinder.record.value"
      style="max-height: 400px"
    >{{ postFinder.record.value }}</pre>
  </div>
</template>
