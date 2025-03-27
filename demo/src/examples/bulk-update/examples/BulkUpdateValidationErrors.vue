<script lang="ts" setup>
import { useBulkUpdater } from '@vuemodel/core'
import { indexedDbState } from '@vuemodel/indexeddb'
import { populateRecords, User } from '@vuemodel/sample-data'
import { ref } from 'vue'

async function setUsers () {
  await indexedDB.deleteDatabase('local:users')
  await populateRecords('users')
  await usersBulkUpdater.index()
  await usersBulkUpdater.makeForms()

  indexedDbState.mockValidationErrors = {
    name: ['bad name'],
  }
}
setUsers()

const rollbacks = ref(true)
const usersBulkUpdater = useBulkUpdater(User, { rollbacks })
</script>

<template>
  <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
    <h1 style="flex: 0 0 100%;">
      changes
    </h1>

    <q-checkbox v-model="rollbacks" />

    <div
      v-for="{ form, failed, id, changes } in usersBulkUpdater.formsWithMeta.value"
      :key="id"
      style="border: 2px solid black; padding: 8px; max-width: 400px"
    >
      <div
        v-if="failed"
        class="text-negative"
      >
        Errors:
      </div>

      <label>
        Name
        <input
          v-model="form.name"
          placeholder="Name"
        >
      </label>

      <label>
        Email
        <input
          v-model="form.email"
          placeholder="Email"
        >
      </label>

      <pre>{{ changes }}</pre>
    </div>

    <button @click="usersBulkUpdater.update()">
      Update
    </button>

    <pre>{{ usersBulkUpdater.validationErrors.value }}</pre>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
