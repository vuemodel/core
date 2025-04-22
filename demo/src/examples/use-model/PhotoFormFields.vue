<script lang="ts" setup>
import type { Form } from '@vuemodel/core'
import type { Photo } from '@vuemodel/sample-data'
import { useTagsIndexer } from './useTagsIndexer'
import { useAlbumsIndexer } from './useAlbumsIndexer'

const form = defineModel<Form<Photo>>('form', { required: true })
const tagsIndexer = useTagsIndexer()
const albumsIndexer = useAlbumsIndexer()
</script>

<template>
  <q-input
    v-model="form.title"
    label="Title"
    filled
  />

  <q-input
    v-model="form.url"
    label="url"
    filled
  />

  <q-select
    v-model="form.album_id"
    filled
    emit-value
    map-options
    label="Album"
    option-label="title"
    option-value="id"
    :options="albumsIndexer.records"
  />

  <q-select
    v-model="form.tags"
    :options="tagsIndexer.records"
    option-label="name"
    multiple
    option-value="id"
    emit-value
    use-chips
    map-options
    label="Tags"
    filled
  />
</template>
