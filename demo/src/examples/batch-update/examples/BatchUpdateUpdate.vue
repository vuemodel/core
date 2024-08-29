<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'

const usersIndexer = useIndexer(User)

async function resetUserData () {
  await clear()
  await populateRecords('users')
  usersIndexer.index()
}

async function makeForms () {
  await usersIndexer.index()
  await usersBatchUpdater.makeForms()
}

const usersBatchUpdater = useBatchUpdater(User)
</script>

<template>
  <div>
    <h1 style="flex: 0 0 100%;">
      Update
    </h1>

    <button @click="resetUserData()">
      Reset User Data
    </button>

    <button @click="makeForms()">
      Make Forms
    </button>

    <button @click="usersBatchUpdater.update()">
      Update
    </button>

    <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
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
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
