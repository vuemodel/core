<script lang="ts" setup>
import { useIndexer } from '@vuemodel/core'
import { User, Post } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'

const persistBy = ref<'save' | 'insert' | 'replace-save' | 'replace-insert'>('insert')
const persistOptions = ['save', 'insert', 'replace-save', 'replace-insert']

const postsIndexer = useIndexer(Post, { persistBy, with: { user: {} } })
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
      label="Index"
      color="primary"
      unelevated
      :loading="postsIndexer.indexing.value"
      class="q-mb-md"
      @click="postsIndexer.index()"
    />

    <pre
      v-if="postsIndexer.records.value.length"
      style="max-height: 400px"
    >{{ postsIndexer.records.value }}</pre>
  </div>
</template>
