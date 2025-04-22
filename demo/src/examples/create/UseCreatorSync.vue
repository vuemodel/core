<script lang="ts" setup>
import { useCreator, useIndexer } from '@vuemodel/core'
import { Photo, populateRecords, Tag } from '@vuemodel/sample-data'
import { clearIndexedDb } from '../bulk-update/clearIndexedDb'

const tagsIndexer = useIndexer(Tag)

async function setup () {
  await clearIndexedDb()
  await populateRecords('tags')
  await tagsIndexer.index()
}

setup()

const photoCreator = useCreator(Photo)
</script>

<template>
  <div
    style="max-width: 350px"
    class="column q-gutter-md"
  >
    <q-input
      v-model="photoCreator.form.value.title"
      for="form-title"
      label="title"
      filled
    />

    <q-select
      v-model="photoCreator.form.value.tags"
      emit-value
      map-options
      filled
      label="tags"
      use-chips
      multiple
      option-label="name"
      option-value="id"
      :options="tagsIndexer.records.value"
    />

    <button
      style="margin-top: 8px"
      :disabled="photoCreator.creating.value"
      @click="photoCreator.create()"
    >
      Create
    </button>

    <pre>{{ photoCreator.record.value }}</pre>
    <pre>{{ photoCreator.response.value }}</pre>
    <pre>{{ photoCreator.validationErrors.value }}</pre>
    <pre>{{ photoCreator.standardErrors.value }}</pre>
  </div>
</template>
