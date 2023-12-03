<script lang="ts" setup>
import { useFinder } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { ref } from 'vue'

const userId = ref('1')
const userFinder = useFinder(User, {
  id: userId,
  with: {
    posts: {
      title: {
        contains: 'est',
      },
    },
  },
})
</script>

<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-input
      v-model="userId"
      dense
      filled
    />

    <q-btn
      label="find"
      color="primary"
      unelevated
      :loading="!!userFinder.finding.value"
      @click="userFinder.find()"
    />

    <pre
      v-if="userFinder.record.value"
      style="max-height: 400px"
    >{{ userFinder.record.value }}</pre>
  </div>
</template>
