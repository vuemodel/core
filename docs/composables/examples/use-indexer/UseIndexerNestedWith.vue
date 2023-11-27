<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

const usersIndexer = useIndexer(User, {
  filters: {
    name: { equals: 'Leanne Graham' },
  },
  with: {
    posts: {
      title: { contains: 'qui est' },
      comments: {
        _orderBy: [{
          field: 'commented_on',
          direction: 'descending',
        }],
      },
    },
  },
})
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Search"
      color="primary"
      unelevated
      :loading="usersIndexer.indexing.value"
      class="q-mb-sm"
      @click="usersIndexer.index()"
    />

    <HighlightedCode
      v-if="usersIndexer.records.value.length"
      style="max-height: 400px"
      :content="JSON.stringify(usersIndexer.records.value, undefined, 2)"
      lang="json"
    />
  </div>
</template>
