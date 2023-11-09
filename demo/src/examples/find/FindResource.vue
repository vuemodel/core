<script lang="ts" setup>
import { findResource, type FindResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const id = ref('')
const result = ref<FindResponse<typeof Post>>()

async function find () {
  result.value = await findResource(Post, id.value)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <label for="form-id">ID</label>
    <input
      id="form-id"
      v-model="id"
    >

    <button @click="find()">
      Find
    </button>

    <pre>{{ result }}</pre>
  </div>
</template>
