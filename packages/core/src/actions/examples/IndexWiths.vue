<script lang="ts" setup>
import { index, IndexResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const response = ref<IndexResponse<typeof Post>>()
async function indexPosts () {
  response.value = await index(Post, {
    with: { comments: { } },
  })
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-btn
        label="Index"
        color="primary"
        unelevated
        @click="indexPosts()"
      />

      <q-btn
        unelevated
        label="Clear"
        @click="response = undefined"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
