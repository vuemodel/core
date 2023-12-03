<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

const postsIndexer = useIndexer(User, { scopes: ['orgWebsite'] })
</script>

<template>
  <div class="q-pa-md">
    <q-btn
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      :disable="postsIndexer.indexing.value"
      class="q-mb-sm"
      @click="postsIndexer.index()"
    />
  </div>
</template>
