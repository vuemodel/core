<script lang="ts" setup>
import { index, IndexResponse } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { ref } from 'vue'

const response = ref<IndexResponse<typeof User>>()
async function indexUsers () {
  response.value = await index(User, {
    with: {
      posts: {
        body: {
          contains: 'est',
        },
        or: [
          {
            created_at: {
              greaterThan: '2023-08-02',
            },
          },
          {
            user_id: {
              equals: '1',
            },
          },
        ],
      },
    },
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
        @click="indexUsers()"
      />

      <q-btn
        label="Clear"
        unelevated
        @click="response = undefined"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
