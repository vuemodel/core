<script lang="ts" setup>
import { find, type FindResponse } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const id = ref('')
const result = ref<FindResponse<typeof Post>>()

async function runFind () {
  result.value = await find(Post, id.value)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <label for="form-id">ID</label>
    <input
      id="form-id"
      v-model="id"
    >

    <button @click="runFind()">
      Find
    </button>

    <pre>{{ result }}</pre>
  </div>
</template>
