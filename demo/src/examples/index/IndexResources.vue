<script lang="ts" setup>
import { indexResources, type IndexResourcesFilters } from '@vuemodel/core'
import type { DeclassifyPiniaOrmModel } from 'pinia-orm-helpers'
import { Post } from 'sample-data'
import { ref } from 'vue'

const result = ref<DeclassifyPiniaOrmModel<Post>[]>([])

async function index () {
  result.value = (await indexResources(Post, {
    filters: filters.value,
  })).data
}

const filters = ref<IndexResourcesFilters<Post>>({
  title: {
    equals: '',
  },
})
</script>

<template>
  <div>
    <input v-model="filters.title.equals">

    <button @click="index()">
      Index!
    </button>

    <pre>{{ result }}</pre>
  </div>
</template>
