<script lang="ts" setup>
import { useBulkUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'

async function resetUserData () {
  await clear()
  await populateRecords('users')
}

const usersBulkUpdater = useBulkUpdater(User)
</script>

<template>
  <div>
    <h1 style="flex: 0 0 100%;">
      Update
    </h1>

    <button @click="resetUserData()">
      Reset User Data
    </button>

    <button @click="usersBulkUpdater.index()">
      Index
    </button>

    <button @click="usersBulkUpdater.makeForms()">
      Make Forms
    </button>

    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
      <div
        v-for="form in usersBulkUpdater.forms.value"
        :key="form.id"
        style="border: 2px solid black; padding: 8px; max-width: 400px"
      >
        <label>
          Name
          <input
            v-model="form.form.name"
            placeholder="Name"
          >
        </label>
        <label>
          Email
          <input
            v-model="form.form.email"
            placeholder="Email"
          >
        </label>
        <pre>{{ form.changes }}</pre>
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
