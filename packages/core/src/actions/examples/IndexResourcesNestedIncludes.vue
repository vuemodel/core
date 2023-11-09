<script lang="ts" setup>
import { indexResources, IndexResponse } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { ref } from 'vue'

const response = ref<IndexResponse<typeof User>>()
async function indexUsers () {
  response.value = await indexResources(User, {
    includes: { posts: { comments: {} } },
  })
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-btn
        label="Index"
        color="primary"
        @click="indexUsers()"
      />

      <q-btn
        label="Clear"
        @click="response = undefined"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
