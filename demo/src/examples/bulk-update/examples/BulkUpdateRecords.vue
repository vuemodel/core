<script lang="ts" setup>
import { useBulkUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import UpdateUsersForms from './UpdateUsersForms.vue'

async function setUsers () {
  await clear()
  await populateRecords('users')
  await populateRecords('posts')
  await usersBulkUpdater.index()
  await usersBulkUpdater.makeForms()
}
setUsers()

const usersBulkUpdater = useBulkUpdater(User, {
  indexer: {
    with: {
      posts: {},
    },
  },
})
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <UpdateUsersForms v-model="usersBulkUpdater.forms.value" />

    <button @click="usersBulkUpdater.makeForms()" />

    <pre>{{ usersBulkUpdater.formsWithMeta.value }}</pre>
  </div>
</template>
