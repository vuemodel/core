<script lang="ts" setup>
import { destroy, DestroyResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const id = ref('1')
const response = ref<DestroyResponse<typeof Post>>()

async function destroyPost () {
  response.value = await destroy(Post, id.value)
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="id"
        label="ID"
        filled
      />

      <q-btn
        label="Destroy"
        color="primary"
        unelevated
        @click="destroyPost()"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
