<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { ref } from 'vue'

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
  <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
    <h1 style="flex: 0 0 100%;">
      changes
    </h1>

    <div
      v-for="formEntry in Object.entries(usersBatchUpdater.forms.value)"
      :key="formEntry[0]"
      style="border: 2px solid black; padding: 8px; max-width: 400px"
    >
      <label>
        Name
        <input
          v-model="usersBatchUpdater.forms.value[formEntry[0]].name"
          placeholder="Name"
        >
      </label>

      <label>
        Email
        <input
          v-model="formEntry[1].email"
          placeholder="Email"
        >
      </label>

      <pre>{{ usersBatchUpdater.changes.value?.[formEntry[0]] }}</pre>
    </div>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
