<script lang="ts" setup>
import { mdiArrowLeft, mdiArrowRight, mdiSkipBackward, mdiSkipForward } from '@quasar/extras/mdi-v7'
import { useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(Post, {
  pagination: { recordsPerPage: 3 },
  paginateImmediate: true,
})
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-sm"
      @click="postsIndexer.index()"
    />

    <div
      v-if="typeof postsIndexer.pagination.value.page === 'number'"
      class="q-gutter-md q-mb-md"
    >
      <q-input
        v-model.number="postsIndexer.pagination.value.recordsPerPage"
        label="Records Per Page"
        filled
        dense
      />

      <q-pagination
        v-model="postsIndexer.pagination.value.page"
        :max="postsIndexer.pagination.value.pagesCount ?? 0"
      />

      <div class="q-gutter-x-sm">
        <q-btn
          :icon="mdiSkipBackward"
          round
          color="primary"
          size="sm"
          @click="postsIndexer.toFirstPage()"
        />
        <q-btn
          :icon="mdiArrowLeft"
          round
          color="primary"
          size="sm"
          @click="postsIndexer.previous()"
        />
        <q-btn
          :icon="mdiArrowRight"
          round
          color="primary"
          size="sm"
          @click="postsIndexer.next()"
        />
        <q-btn
          :icon="mdiSkipForward"
          round
          color="primary"
          size="sm"
          @click="postsIndexer.toLastPage()"
        />
      </div>

      <div class="row items-center">
        <q-input
          v-model.number="postsIndexer.pagination.value.page"
          label="Go To Page"
          filled
          dense
        />
      </div>
    </div>

    <HighlightedCode
      v-if="postsIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(postsIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
