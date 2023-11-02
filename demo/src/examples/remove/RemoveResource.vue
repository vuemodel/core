<script lang="ts" setup>
import { removeResource } from '@vuemodel/core'
import { Post } from 'sample-data'
import { ref } from 'vue'

const id = ref('')
</script>

<template>
    <div style="display: flex; flex-direction: column; max-width: 350px">
      <label for="form-id">ID</label>
      <input id="form-id" v-model="id" />

      <button @click="removeResource(Post, id)">Remove</button>
    </div>
</template>
