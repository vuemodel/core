<script lang="ts" setup>
import { useFinder } from '@vuemodel/core'
import { User, Post } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'

const persistBy = ref<'save' | 'insert'>('insert')
const persistOptions = ['save', 'insert']

const postFinder = useFinder(Post, { persistBy, with: { user: {} } })
const postRepo = useRepo(Post)
const userRepo = useRepo(User)
</script>

<template>
  <div class="q-pa-md">
    <q-select
      v-model="persistBy"
      filled
      label="Persist By"
      dense
      :options="persistOptions"
      class="q-mb-md col"
    >
      <template #after>
        <q-btn
          label="Flush Store"
          color="secondary"
          unelevated
          @click="() => {
            postRepo.flush()
            userRepo.flush()
          }"
        />
      </template>
    </q-select>

    <q-btn
      label="Find"
      color="primary"
      unelevated
      :loading="!!postFinder.finding.value"
      class="q-mb-md"
      @click="postFinder.find()"
    />

    <pre
      v-if="postFinder.record.value"
      style="max-height: 400px"
    >{{ postFinder.record.value }}</pre>
  </div>
</template>
