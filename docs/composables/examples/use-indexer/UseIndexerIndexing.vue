<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { User } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(User, { scopes: ['orgWebsite'] })
async function indexPosts () {
  piniaLocalStorageState.mockLatencyMs = 1500
  postsIndexer.index()
  piniaLocalStorageState.mockLatencyMs = undefined
}
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      :disable="postsIndexer.indexing.value"
      class="q-mb-sm"
      @click="indexPosts()"
    />
  </div>
</template>
