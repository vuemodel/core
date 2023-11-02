<script lang="ts" setup>
import { createResource } from '@vuemodel/core'
import { Post } from 'sample-data'
import { ref } from 'vue'
import { type PiniaOrmForm } from 'pinia-orm-helpers'

const form = ref<PiniaOrmForm<Post>>({})
</script>

<template>
    <div style="display: flex; flex-direction: column; max-width: 350px">
      <label for="form-id">ID</label>
      <input id="form-id" v-model="form.id" />

      <label for="form-title">Title</label>
      <input id="form-title" v-model="form.title" />

      <label for="form-body">Body</label>
      <textarea id="form-body" v-model="form.body" />

      <button
        style="margin-top: 8px"
        @click="createResource(Post, form)"
      >Create!</button>
    </div>
</template>
