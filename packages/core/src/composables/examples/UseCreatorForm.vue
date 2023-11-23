<script lang="ts" setup>
import { Post } from '@vuemodel/sample-data'
import { useCreator } from '@vuemodel/core'

const postCreator = useCreator(Post)
</script>

<template>
  <q-form
    class="q-gutter-y-md q-pa-md"
    @submit="postCreator.create()"
  >
    <q-input
      v-model="postCreator.form.value.title"
      label="Title"
      filled
    />

    <q-btn
      color="primary"
      type="submit"
      label="Create"
      unelevated
    />

    <pre>{{ postCreator.record.value }}</pre>
  </q-form>
</template>
