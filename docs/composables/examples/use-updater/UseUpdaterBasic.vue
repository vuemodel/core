<script lang="ts" setup>
import { useUpdater } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postUpdater = useUpdater(Post, { id: postId })
postUpdater.makeForm()
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      label="Post ID"
      filled
    />

    <q-btn
      label="Make Form"
      no-caps
      color="primary"
      unelevated
      :loading="!!postUpdater.makingForm.value"
      @click="postUpdater.makeForm()"
    />

    <q-input
      v-model="postUpdater.form.value.title"
      label="Title"
      filled
    />

    <q-btn
      label="Update"
      color="primary"
      unelevated
      :loading="!!postUpdater.updating.value"
      @click="postUpdater.update()"
    />

    <pre
      v-if="postUpdater.record.value"
      style="max-height: 400px"
    >{{ postUpdater.record.value }}</pre>
  </div>
</template>
