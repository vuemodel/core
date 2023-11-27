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

    <HighlightedCode
      v-if="postCreator.record.value"
      style="max-height: 400px"
      :content="JSON.stringify(postCreator.record.value, undefined, 2)"
      lang="json"
    />
  </q-form>
</template>
