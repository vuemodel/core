<script lang="ts" setup>
import { Form, update, UpdateResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const form = ref<Form<Post>>({ title: '' })
const id = ref('1')
const response = ref<UpdateResponse<typeof Post>>()

async function updatePost () {
  response.value = await update(
    Post,
    id.value,
    form.value,
  )
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

      <q-input
        v-model="form.title"
        label="Title"
        filled
      />

      <q-input
        v-model="form.body"
        type="textarea"
        label="Body"
        filled
      />

      <q-btn
        label="Update"
        color="primary"
        unelevated
        @click="updatePost()"
      />
    </div>

    <pre v-if="response">{{ response }}</pre>
  </div>
</template>
