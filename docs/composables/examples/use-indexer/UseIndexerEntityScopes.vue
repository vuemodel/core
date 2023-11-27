<script lang="ts" setup>
import { useIndexer, vueModelState } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

if (!vueModelState.config) {
  vueModelState.config = {}
}

vueModelState.config.entityScopes = {
  users: {
    orgWebsite: {
      filters: {
        website: {
          endsWith: '.org',
        },
      },
    },
  },
}

const usersIndexer = useIndexer(User, { scopes: ['orgWebsite'] })
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
