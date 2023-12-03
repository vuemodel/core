<script lang="ts" setup>
import { useUpdater } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'

const postRepo = useRepo(Post)

const postId = ref('1')
const postUpdater = useUpdater(Post, { id: postId })
postUpdater.makeForm()

async function makeForm () {
  // Destroy all records from the store. This means we'll
  // have to make a request when making the form. We
  // need to make a request to show the spinner.
  postRepo.flush()
  postUpdater.makeForm()
}
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="postId"
        label="Post ID"
        filled
      />

      <q-btn
        label="Make Form"
        no-caps
        color="primary"
        :loading="!!postUpdater.makingForm.value"
        unelevated
        @click="makeForm()"
      />

      <q-form
        v-if="!postUpdater.makingForm.value"
        class="q-gutter-y-md"
      >
        <q-input
          v-model="postUpdater.form.value.title"
          label="Title"
          filled
        />

        <q-btn
          label="Update"
          color="primary"
          unelevated
          @click="postUpdater.update()"
        />
      </q-form>

      <pre
        v-if="postUpdater.record.value"
        style="max-height: 400px"
      >{{ postUpdater.record.value }}</pre>
    </div>
  </div>
</template>
