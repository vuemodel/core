<script lang="ts" setup>
import { useBulkUpdater, useIndexer } from '@vuemodel/core'
import { deleteDatabases } from '@vuemodel/indexeddb'
import { Tag, populateRecords, Photo } from '@vuemodel/sample-data'

const photosIndexer = useIndexer(Photo, {
  with: 'tags',
})
const tagsIndexer = useIndexer(Tag)

async function resetPhotoData () {
  await deleteDatabases()
  await populateRecords('photos')
  await populateRecords('tags')
  await populateRecords('photo_tags')
  photosIndexer.index()
}

async function makeForms () {
  await photosIndexer.index()
  await tagsIndexer.index()
  await photosBulkUpdater.makeForms()
  await tagsBulkUpdater.makeForms()
}

const photosBulkUpdater = useBulkUpdater(Photo, {
  pagination: { recordsPerPage: 2 },
})

const tagsBulkUpdater = useBulkUpdater(Tag, {
  pagination: { recordsPerPage: 2 },
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
      Make All Forms
    </button>

    <h2>Photos Updater</h2>

    <button @click="photosBulkUpdater.update()">
      Update Photos
    </button>

    <div style="display: flex; flex-direction: row; max-width: 1200px; flex-wrap: wrap;">
      <div
        v-for="formEntry in Object.entries(photosBulkUpdater.forms.value)"
        :key="formEntry[0]"
        style="border: 2px solid black; padding: 8px; max-width: 400px"
      >
        <label>
          Title
          <input
            v-model="photosBulkUpdater.forms.value[formEntry[0]].title"
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
        <pre>{{ photosBulkUpdater.forms.value?.[formEntry[0]] }}</pre>
        Changes
        <pre>{{ photosBulkUpdater.changes.value?.[formEntry[0]] }}</pre>
      </div>
    </div>

    <h2>Tags Updater</h2>

    <button @click="tagsBulkUpdater.update()">
      Update Tags
    </button>

    <div style="display: flex; flex-direction: row; max-width: 1200px; flex-wrap: wrap;">
      <div
        v-for="formEntry in Object.entries(tagsBulkUpdater.forms.value)"
        :key="formEntry[0]"
        style="border: 2px solid black; padding: 8px; max-width: 400px"
      >
        <label>
          Name
          <input
            v-model="tagsBulkUpdater.forms.value[formEntry[0]].name"
            placeholder="Name"
          >
        </label>

        <label>
          photos
          <select
            v-model="formEntry[1].photos"
            multiple
            placeholder="Tags"
            style="height: 300px"
          >
            <option
              v-for="photo in photosIndexer.records.value"
              :key="photo.id"
              :value="photo.id"
            >{{ photo.title }}</option>
          </select>
        </label>

        Form
        <pre>{{ tagsBulkUpdater.forms.value?.[formEntry[0]] }}</pre>
        Changes
        <pre>{{ tagsBulkUpdater.changes.value?.[formEntry[0]] }}</pre>
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
