<script lang="ts" setup>
import { mdiDelete } from '@quasar/extras/mdi-v7'
import { useDestroyer, useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postDestroyer = useDestroyer(Post, { id: postId })
const postsIndexer = useIndexer(Post, {
  immediate: true,
  pagination: { recordsPerPage: 5 },
})
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <div>Destroying: {{ postDestroyer.destroying.value }}</div>

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
            :icon="mdiDelete"
            round
            :loading="postDestroyer.destroying.value === post.id"
            size="sm"
            @click="() => {
              postId = post.id
              postDestroyer.destroy()
            }"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
