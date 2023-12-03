<script lang="ts" setup>
import { useFinder, useIndexer } from '@vuemodel/core'
import { Post, User, Comment } from '@vuemodel/sample-data'
import { computed } from 'vue'

const usersFinder = useFinder(User)
const postsFinder = useIndexer(Post)
const commentsFinder = useIndexer(Comment)

async function fetchAll () {
  usersFinder.find()
  postsFinder.index()
  commentsFinder.index()
}

const userPopulated = computed(() => {
  return usersFinder.makeQuery()
    .with('posts', query => query.with('comments'))
    .first()
})
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-btn
      label="Find"
      no-caps
      color="primary"
      @click="fetchAll()"
    />

    <pre
      v-if="userPopulated"
      style="max-height: 400px"
    >{{ userPopulated }}</pre>
  </div>
</template>
