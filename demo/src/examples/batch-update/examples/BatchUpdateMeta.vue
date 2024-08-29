<script lang="ts" setup>
import { useBatchUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'
import { reactive } from 'vue'

async function resetUserData () {
  await clear()
  await populateRecords('users')
}

async function makeForms () {
  await usersBatchUpdater.index()
}

const usersBatchUpdater = reactive(useBatchUpdater(User, {
  excludeFields: ['tenant_id', 'age'],
  autoUpdate: true,
  autoUpdateDebounce: 1500,
  // with: { posts: {} }
}))
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
      <!-- postsForm -->
      <div
        v-for="({ id, form, fields, changed, updating }) in usersBatchUpdater.formsWithMeta"
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

        <!-- <div>
          <div
            v-for="({ id, form, fields, changed, updating, authorsForms }) in postsForms"
            :key="id"
          >
            <input v-model="form.title">

            <div
              v-for="({ id, form, fields, changed, updating }) in authorsForms"
              :key="id"
            >
              {{ fields.name.updating ? 'updating' : 'Name...' }}
              <input v-model="form.name">
            </div>
          </div>
        </div> -->
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
