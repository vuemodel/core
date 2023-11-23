<script lang="ts" setup>
import { find, FindResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const id = ref('5')
const response = ref<FindResponse<typeof Post>>()

async function findPost () {
  response.value = await find(Post, id.value)
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
        label="Find"
        color="primary"
        unelevated
        @click="findPost()"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
