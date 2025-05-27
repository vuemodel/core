<script lang="ts" setup>
import { update, type Form } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const form = ref<Form<Post>>({})
const id = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <label for="form-id">ID</label>
    <input
      id="form-id"
      v-model="id"
    >

    <label for="form-title">Title</label>
    <input
      id="form-title"
      v-model="form.title"
    >

    <label for="form-body">Body</label>
    <textarea
      id="form-body"
      v-model="form.body"
    />

    <button
      style="margin-top: 8px"
      @click="update(Post, id, form)"
    >
      Update!
    </button>
  </div>
</template>
