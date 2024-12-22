<script lang="ts" setup>
import { useBulkUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { useRepo } from 'pinia-orm'
import { reactive, ref } from 'vue'

async function resetUserData () {
  await clear()
  await populateRecords('users')
}

// async function makeForms () {
//   await usersBulkUpdater.index()
//   await usersBulkUpdater.makeForms()
// }

const usersBulkUpdater = reactive(useBulkUpdater(User, {
  immediatelyMakeForms: true,
  onSuccess () {
    console.log('success!')
  },
  persist: false,
  pagination: {
    recordsPerPage: 3,
    page: 1,
  },
}))

const idInput = ref('')
const nameInput = ref('')
</script>

<template>
  <div>
    <button
      v-for="i in (usersBulkUpdater.pagination.pagesCount ?? 0)"
      :key="i"
      @click="usersBulkUpdater.toPage(i)"
    >
      {{ i }}
    </button>

    <h1 style="flex: 0 0 100%;">
      Update
    </h1>

    <button @click="resetUserData()">
      Reset User Data
    </button>

    <button
      @click="usersBulkUpdater.update()"
    >
      Update
    </button>

    <div style="margin-top: 8px;">
      <input
        v-model="idInput"
        placeholder="ID"
      >
      <input
        v-model="nameInput"
        placeholder="Name"
      >
      <button
        @click="usersBulkUpdater.update({
          forms: {
            [idInput]: { name: nameInput }
          }
        })"
      >
        Update
      </button>
    </div>

    <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
      <!-- postsForm -->
      <div
        v-for="({ id, form, fields, changed, updating }) in usersBulkUpdater.formsWithMeta"
        :key="id"
        :style="`
          border: 2px solid black;
          padding: 8px;
          max-width: 400px;
          background-color: ${changed ? '#ffeed6' : 'initial'};
        `"
      >
        <h2>{{ form.name }} {{ updating ? '(Updating)' : '' }}</h2>

        <label>
          Name {{ fields.name.updating ? '(Updating)' : '' }}
          <input
            v-model="form.name"
            placeholder="Name"
            :style="`
              border-left: 6px solid ${fields.name.changed ? '#e2941f' : 'initial'};
            `"
          >
        </label>
        <label>
          Email {{ fields?.email.updating ? '(Updating)' : '' }}
          <input
            v-model="form.email"
            placeholder="Email"
            :style="`
              border-left: 6px solid ${fields.email.changed ? '#e2941f' : 'initial'};
            `"
          >
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}

input {
  outline: none;
}
</style>
