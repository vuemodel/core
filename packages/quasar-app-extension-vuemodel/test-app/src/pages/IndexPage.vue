<script setup lang="ts">
import { mdiClose, mdiPlus } from '@quasar/extras/mdi-v7'
import { useModel } from '@vuemodel/core'
import { User } from 'src/models/User'

const userService = useModel(User, {
  update: {
    immediatelyMakeForms: true,
  },
})
</script>

<template>
  <q-page padding>
    <pre>{{ userService.updater.records.value }}</pre>

    <q-page-sticky
      position="bottom-right"
      :offset="[12,12]"
    >
      <q-btn
        :icon="mdiPlus"
        color="accent"
        fab
        @click="userService.creator.showForm.value = true"
      />
    </q-page-sticky>

    <q-dialog v-model="userService.creator.showForm.value">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>
            Create User
          </q-toolbar-title>
          <q-btn
            flat
            round
            :icon="mdiClose"
          />
        </q-toolbar>

        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="userService.creator.form.value.name"
            filled
            label="Name"
          />

          <q-input
            v-model="userService.creator.form.value.email"
            filled
            label="Email"
          />

          <q-btn
            :loading="userService.creator.creating.value"
            label="Create"
            color="primary"
            @click="userService.creator.create()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
