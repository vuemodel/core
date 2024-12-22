<script lang="ts" setup>
import { bulkUpdate } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'

async function runBulkUpdate () {
  await bulkUpdate(
    Post,
    {
      1: { title: 'one' },
      2: { title: 'two' },
      3: { title: 'three' },
      4: { body: 'body for 4' },
    },
  )
}
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <button @click="runBulkUpdate">
      runBulkUpdate
    </button>
  </div>
</template>
