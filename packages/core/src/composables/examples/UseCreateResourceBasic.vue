<script lang="ts" setup>
import { useCreateResource } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreateResource(Post)
</script>

<template>
  <div
    flat
    bordered
    class="q-pa-md"
  >
    <div class="q-gutter-y-md">
      <q-input
        v-model="postCreator.form.value.title"
        label="Title"
        filled
      />

      <q-btn
        label="Create"
        color="primary"
        @click="postCreator.create()"
      />
    </div>

    <q-card
      v-if="postCreator.record.value"
      flat
      bordered
      class="q-mt-md"
    >
      <q-card-section>
        <div class="text-body1">
          postCreator.record.value
        </div>
        <pre>{{ postCreator.record.value }}</pre>
      </q-card-section>
    </q-card>
  </div>
</template>
