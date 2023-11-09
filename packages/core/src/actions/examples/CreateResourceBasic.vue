<script lang="ts" setup>
import { Form, createResource } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const form = ref<Form<Post>>({ title: '' })

async function createPost () {
  const response = await createResource(Post, form.value)
  alert(`created post: ${JSON.stringify(response.record, undefined, 2)}`)
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
        @click="createPost()"
      />
    </div>
  </div>
</template>
