<script lang="ts" setup>
import { useUpdater } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'

const userUpdater = useUpdater(User, { id: '1' })
userUpdater.makeForm()
userUpdater.form.value.name = 'Second Precedence'
userUpdater.form.value.username = 'Will be overwritten by update()'

async function update () {
  userUpdater.update({
    username: 'First Precedence',
  })
}
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-btn
      label="Update"
      color="primary"
      unelevated
      :loading="!!userUpdater.updating.value"
      @click="update()"
    />

    <pre
      v-if="userUpdater.record.value"
      style="max-height: 400px"
    >{{ userUpdater.record.value }}</pre>
  </div>
</template>
