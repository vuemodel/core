<script lang="ts" setup>
import { useBulkUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import UpdateUsersForms from './UpdateUsersForms.vue'

const usersIndexer = useIndexer(User)
async function setUsers () {
  await clear()
  await populateRecords('users')
  await usersIndexer.index()
  usersBulkUpdater.makeForms()
}
setUsers()

const usersBulkUpdater = useBulkUpdater(User)
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <UpdateUsersForms v-model="usersBulkUpdater.forms.value" />

    <pre>{{ usersBulkUpdater.records.value }}</pre>
  </div>
</template>
