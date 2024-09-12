<script lang="ts" setup>
import { destroy } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const id = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <label for="form-id">Post ID</label>
    <input
      id="form-id"
      v-model="id"
    >

    <button @click="destroy(Post, id)">
      Destroy
    </button>
  </div>
</template>
