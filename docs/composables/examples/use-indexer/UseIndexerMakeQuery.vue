<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { Post, User, Comment } from '@vuemodel/sample-data'
import { computed } from 'vue'

const usersIndexer = useIndexer(User)
const postsIndexer = useIndexer(Post)
const commentsIndexer = useIndexer(Comment)

async function indexAll () {
  usersIndexer.index()
  postsIndexer.index()
  commentsIndexer.index()
}

const usersPopulated = computed(() => {
  return usersIndexer.makeQuery()
    .with('posts', query => query.with('comments'))
    .get()
})
</script>

<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-sm">
      <q-btn
        label="Index"
        no-caps
        color="primary"
        @click="indexAll()"
      />
    </div>

    <pre
      v-if="usersPopulated.length"
      style="max-height: 400px"
    >{{ usersPopulated }}</pre>
  </div>
</template>
