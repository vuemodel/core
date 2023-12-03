<script lang="ts" setup>
import { IndexResponse, index } from '@vuemodel/core'
import { ref } from 'vue'
import { Post } from '@vuemodel/sample-data'

const response = ref<IndexResponse<typeof Post>>()
const indexing = ref(false)

let controller: AbortController

async function indexPosts () {
  controller = new AbortController()
  const signal = controller.signal
  signal.onabort = () => {
    indexing.value = false
  }

  indexing.value = true
  response.value = await index(Post, { signal })
  indexing.value = false
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <div class="q-gutter-md">
        <q-btn
          label="Index"
          color="primary"
          unelevated
          :loading="indexing"
          @click="indexPosts()"
        />

        <q-btn
          label="Cancel"
          unelevated
          @click="controller.abort('User cancelled the request')"
        />

        <q-btn
          label="Clear"
          unelevated
          @click="response = undefined"
        />
      </div>
    </div>
    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
