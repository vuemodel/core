<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { ref } from 'vue'

const usersIndexer = useIndexer(User)
async function setUsers () {
  await clear()
  await populateRecords('users')
  usersIndexer.index()
}
setUsers()

const usersBatchUpdater = useBatchUpdater(User)

const ids = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <h1>makeForms</h1>

    <label for="ids-input">IDs (comma separated)</label>
    <input
      id="ids-input"
      v-model="ids"
    >

    <button @click="ids ? usersBatchUpdater.makeForms(ids.split(',')) : usersBatchUpdater.makeForms()">
      makeForms
    </button>

    <pre>{{ usersBatchUpdater.forms.value }}</pre>
  </div>
</template>
