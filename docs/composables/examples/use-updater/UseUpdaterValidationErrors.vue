<script lang="ts" setup>
import { useUpdater } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'
import { indexedDbState } from '../../../../packages/indexeddb/dist'

const postId = ref('1')
const postUpdater = useUpdater(Post, {
  id: postId,
  immediatelyMakeForm: true,
})

async function update () {
  indexedDbState.mockValidationErrors = {
    title: [
      'title must be at least one billion characters long',
      'title must be super enticing',
    ],
    body: [
      'the body must xyz',
    ],
  }
  await postUpdater.update()
  indexedDbState.mockValidationErrors = undefined
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="postId"
      label="Post ID"
      filled
    />

    <q-input
      v-model="postUpdater.form.value.title"
      label="Title"
      filled
      :error="!!postUpdater.validationErrors.value.title"
      :error-message="postUpdater.validationErrors.value.title?.join('. ')"
      hide-bottom-space
      @update:model-value="delete postUpdater.validationErrors.value.title"
    />

    <q-input
      v-model="postUpdater.form.value.body"
      type="textarea"
      label="Body"
      filled
      :error="!!postUpdater.validationErrors.value.body"
      :error-message="postUpdater.validationErrors.value.body?.join('. ')"
      hide-bottom-space
      @update:model-value="delete postUpdater.validationErrors.value.body"
    />

    <q-btn
      label="Update"
      color="primary"
      unelevated
      :loading="!!postUpdater.updating.value"
      @click="update()"
    />

    <pre
      v-if="postUpdater.record.value"
      style="max-height: 400px"
    >{{ postUpdater.record.value }}</pre>
  </div>
</template>
