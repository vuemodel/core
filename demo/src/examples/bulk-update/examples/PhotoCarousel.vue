<script lang="ts" setup>
import { useIndexer, type BulkUpdateMeta } from '@vuemodel/core'
import { Tag, type Photo } from '@vuemodel/sample-data'
import { ref } from 'vue'

const props = defineProps<{
  photoForms: BulkUpdateMeta<Photo>[]
}>()

const currentSlide = ref<string | null>(props.photoForms[0]?.id ?? null)

const tagsIndexer = useIndexer(Tag)

tagsIndexer.index()
</script>

<template>
  <q-carousel
    v-model="currentSlide"
    animated
    arrows
    navigation
    infinite
  >
    <q-carousel-slide
      v-for="photo in photoForms"
      :key="photo?.id"
      :name="photo?.id"
      :img-src="photo?.form.thumbnailUrl"
    >
    <q-menu class="q-pa-sm" context-menu>
          <pre>{{ photo.form.tags }}</pre>
          <q-select
            v-if="photo.record"
            v-model="photo.form.tags"
            multiple
            filled
            option-label="name"
            option-value="id"
            emit-value
            map-options
            :options="tagsIndexer.records.value"
          />
        </q-menu>
      <q-chip
        v-for="tag in photo?.record?.tags"
        :key="tag.id"
        :label="tag.name"
        :color="tag.color"
        text-color="white"
        removable
        @remove="() => {
          photo.form.tags = photo.form.tags?.filter(val => val !== tag.id)
        }"
      >

      </q-chip>
    </q-carousel-slide>
  </q-carousel>
</template>
