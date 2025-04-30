<script lang="ts" setup>
import { Form, create, CreateResponse } from '@vuemodel/core'
import { indexedDbState } from '@vuemodel/indexeddb'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const mockValidationErrors = {
  body: [
    '"body" field is required',
    '"body" must be more than 20 characters',
  ],
}

const form = ref<Form<Post>>({ title: '' })
const response = ref<CreateResponse<typeof Post>>()

async function createPost () {
  indexedDbState.mockValidationErrors = mockValidationErrors
  response.value = await create(Post, form.value)
  indexedDbState.mockValidationErrors = undefined
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="form.title"
        label="Title"
        filled
        :error="!!response?.validationErrors?.body"
        :error-message="response?.validationErrors?.body?.join(', ')"
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        @click="createPost()"
      />
    </div>
  </div>
</template>
