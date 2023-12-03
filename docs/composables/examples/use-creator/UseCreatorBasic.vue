<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreator(Post)
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postCreator.form.value.title"
      label="Title"
      filled
    />

    <q-btn
      label="Create"
      color="primary"
      unelevated
      @click="postCreator.create()"
    />

    <pre
      v-if="postCreator.record.value"
      style="max-height: 400px"
    >{{ postCreator.record.value }}</pre>
  </div>
</template>
