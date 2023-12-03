<script lang="ts" setup>
import { useDestroyer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postDestroyer = useDestroyer(Post, { id: postId })
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      dense
      filled
    />

    <q-btn
      label="destroy"
      color="primary"
      unelevated
      :loading="!!postDestroyer.destroying.value"
      @click="postDestroyer.destroy()"
    />

    <pre
      v-if="postDestroyer.record.value"
      style="max-height: 400px"
    >{{ postDestroyer.record.value }}</pre>
  </div>
</template>
