<script lang="ts" setup>
import { onModel, useCreator } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const creator = useCreator(Post)

onModel('created', ({ response, entity }) => {
  console.log('response', response.record)
  console.log('entity', entity)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <label for="form-id">ID</label>
    <input
      id="form-id"
      v-model="creator.form.value.id"
    >

    <label for="form-title">Title</label>
    <input
      id="form-title"
      v-model="creator.form.value.title"
    >

    <label for="form-body">Body</label>
    <textarea
      id="form-body"
      v-model="creator.form.value.body"
    />

    <button
      style="margin-top: 8px"
      :disabled="creator.creating.value"
      @click="creator.create()"
    >
      Create
    </button>

    <pre>{{ creator.record.value }}</pre>
  </div>
</template>
