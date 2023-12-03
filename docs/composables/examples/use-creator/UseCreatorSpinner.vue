<script lang="ts" setup>
import { useCreator } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postCreator = useCreator(Post)
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-input
        v-model="postCreator.form.value.title"
        label="Title"
        filled
      />

      <q-btn
        label="Create"
        color="primary"
        unelevated
        :loading="postCreator.creating.value"
        @click="postCreator.create()"
      />
    </div>
  </div>
</template>
