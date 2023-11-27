<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreator(Post)

async function createPost () {
  piniaLocalStorageState.mockLatencyMs = 2000
  await postCreator.create()
  piniaLocalStorageState.mockLatencyMs = 0
}

</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="postCreator.form.value.title"
        label="Title"
        filled
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        :loading="postCreator.creating.value"
        @click="createPost()"
      />
    </div>
  </div>
</template>
