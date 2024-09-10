<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { Tag, populateRecords, Photo } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'

const photosIndexer = useIndexer(Photo, {
  with: 'tags',
})
const tagsIndexer = useIndexer(Tag)

async function resetPhotoData () {
  await clear()
  await populateRecords('photos')
  await populateRecords('tags')
  await populateRecords('photo_tags')
  photosIndexer.index()
}

async function makeForms () {
  await photosIndexer.index()
  await tagsIndexer.index()
  await photosBatchUpdater.makeForms()
}

const photosBatchUpdater = useBatchUpdater(Photo, {
  pagination: { recordsPerPage: 3 },
})
</script>

<template>
  <div>
    <h1 style="flex: 0 0 100%;">
      Update
    </h1>

    <button @click="resetPhotoData()">
      Reset Photo Data
    </button>

    <button @click="makeForms()">
      Make Forms
    </button>

    <button @click="photosBatchUpdater.update()">
      Update
    </button>

    <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
      <div
        v-for="formEntry in Object.entries(photosBatchUpdater.forms.value)"
        :key="formEntry[0]"
        style="border: 2px solid black; padding: 8px; max-width: 400px"
      >
        <label>
          Title
          <input
            v-model="photosBatchUpdater.forms.value[formEntry[0]].title"
            placeholder="Title"
          >
        </label>

        <label>
          tags
          <select
            v-model="formEntry[1].tags"
            multiple
            placeholder="Tags"
          >
            <option
              v-for="tag in tagsIndexer.records.value"
              :key="tag.id"
              :value="tag.id"
            >{{ tag.name }}</option>
          </select>
        </label>

        Form
        <pre>{{ photosBatchUpdater.forms.value?.[formEntry[0]] }}</pre>
        Changes
        <pre>{{ photosBatchUpdater.changes.value?.[formEntry[0]] }}</pre>
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
