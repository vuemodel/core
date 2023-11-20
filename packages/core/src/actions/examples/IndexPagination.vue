<script lang="ts" setup>
import { index, IndexResponse } from '@vuemodel/core'
import { Comment } from '@vuemodel/sample-data'
import { ref } from 'vue'
import { mdiArrowRight, mdiArrowLeft } from '@quasar/extras/mdi-v7'

const page = ref(1)

const response = ref<IndexResponse<typeof Comment>>()
async function indexComments (pageParam?: number) {
  response.value = await index(Comment, {
    pagination: {
      recordsPerPage: 3,
      page: pageParam ?? 1,
    },
  })
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <div class="q-gutter-md">
        <q-btn
          label="Index"
          color="primary"
          @click="indexComments()"
        />
        <q-btn
          label="Clear"
          @click="response = undefined"
        />
      </div>

      <div class="q-gutter-md">
        <q-btn
          :icon="mdiArrowLeft"
          @click="() => {
            page--
            indexComments(page)
          }"
        />
        <q-btn
          :icon="mdiArrowRight"
          @click="() => {
            page++
            indexComments(page)
          }"
        />
      </div>
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
