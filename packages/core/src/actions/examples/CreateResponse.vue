<script lang="ts" setup>
import { Form, create, CreateResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const form = ref<Form<Post>>({ title: '' })
const response = ref<CreateResponse<typeof Post>>()

async function createPost () {
  response.value = await create(Post, form.value)
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="form.title"
        label="Title"
        filled
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        @click="createPost()"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
