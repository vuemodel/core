<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import UpdateUsersForms from './UpdateUsersForms.vue'

const usersIndexer = useIndexer(User)
async function setUsers () {
  await clear()
  await populateRecords('users')
  await usersIndexer.index()
  usersBatchUpdater.makeForms()
}
setUsers()

const usersBatchUpdater = useBatchUpdater(User)
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <button @click="usersBatchUpdater.update()">
      Update
    </button>

    <UpdateUsersForms v-model="usersBatchUpdater.forms.value" />

    <pre>{{ usersBatchUpdater.records.value }}</pre>
  </div>
</template>
