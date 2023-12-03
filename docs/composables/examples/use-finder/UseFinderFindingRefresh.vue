<script lang="ts" setup>
import { mdiRefresh } from '@quasar/extras/mdi-v7'
import { useFinder, useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postFinder = useFinder(Post, { id: postId })
const postsIndexer = useIndexer(Post, {
  immediate: true,
  pagination: { recordsPerPage: 5 },
})
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <div>Finding: {{ postFinder.finding.value }}</div>

    <q-list bordered>
      <q-item
        v-for="post in postsIndexer.records.value"
        :key="post.id"
      >
        <q-item-section>
          {{ post.title }}
        </q-item-section>

        <q-item-section side>
          <q-btn
            flat
            :icon="mdiRefresh"
            round
            :loading="postFinder.finding.value === post.id"
            size="sm"
            @click="() => {
              postId = post.id
              postFinder.find()
            }"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
