<script lang="ts" setup>
import { index, type IndexFilters } from '@vuemodel/core'
import type { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { Post, populateRecords } from '@vuemodel/sample-data'
import { ref } from 'vue'

const result = ref<DeclassifyPiniaOrmModel<Post>[]>([])

async function runIndex () {
  result.value = (await index(Post, {
    filters: filters.value.title?.equals ? filters.value : undefined,
  })).records
}

const filters = ref<IndexFilters<Post>>({
  title: {
    equals: '',
  },
})
</script>

<template>
  <div>
    <input v-model="filters.title.equals">

    <button @click="populateRecords('posts')">
      Populate Records!
    </button>

    <button @click="runIndex()">
      Index!
    </button>

    <pre>{{ result }}</pre>
  </div>
</template>
