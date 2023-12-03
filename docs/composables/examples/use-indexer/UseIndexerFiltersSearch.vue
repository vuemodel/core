<script lang="ts" setup>
import { mdiMagnify } from '@quasar/extras/mdi-v7'
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { watchDebounced } from '@vueuse/core'
import { ref } from 'vue'

const search = ref('')
const debounce = ref(500)

const postsIndexer = useIndexer(Post, {
  filters: () => {
    return {
      title: {
        contains: search.value,
      },
    }
  },
})

watchDebounced(search, () => {
  postsIndexer.index()
}, { debounce })
</script>

<template>
  <div
    flat
    bordered
    class="q-pa-md q-gutter-y-md"
  >
    <q-input
      v-model="search"
      outlined
      dense
      class="q-mb-sm"
      clearable
    >
      <template #prepend>
        <q-icon :name="mdiMagnify" />
      </template>
    </q-input>

    <q-input
      v-model="debounce"
      dense
      label="debounce (ms)"
      filled
      type="number"
    />

    <q-btn
      label="Search"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-md"
      @click="postsIndexer.index()"
    />

    <pre
      v-if="postsIndexer.records.value.length"
      style="max-height: 400px"
    >{{ postsIndexer.records.value }}</pre>
  </div>
</template>
