<script lang="ts" setup>
import { useUpdater, useIndexer } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { ref } from 'vue'

const postId = ref('1')
const postUpdater = useUpdater(Post, {
  id: postId,
  optimistic: true,
})
const postsIndexer = useIndexer(Post, {
  immediate: true,
  pagination: { recordsPerPage: 5 },
  orderBy: [{ field: 'created_at', direction: 'descending' }],
})

const focusedPostId = ref()
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <div>Updating: {{ postUpdater.updating.value }}</div>

    <q-list bordered>
      <q-item
        v-for="post in postsIndexer.records.value"
        :key="post.id"
      >
        <q-item-section>
          <q-input
            :model-value="focusedPostId === post.id ? postUpdater.form.value.title : post.title"
            :borderless="focusedPostId !== post.id"
            :filled="focusedPostId === post.id"
            dense
            :style="{
              paddingLeft: focusedPostId !== post.id ? '12px' : undefined,
              paddingRight: focusedPostId !== post.id ? '12px' : undefined
            }"
            :loading="postUpdater.updating.value === post.id"
            @update:model-value="val => (postUpdater.form.value.title = String(val))"
            @focus="() => {
              postUpdater.makeForm(post.id)
              postId = post.id
              focusedPostId = post.id
            }"
            @focusout="() => {
              postUpdater.update()
              focusedPostId = undefined
            }"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
