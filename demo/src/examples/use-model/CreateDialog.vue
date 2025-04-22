<script lang="ts" setup>
import PhotoFormFields from './PhotoFormFields.vue'
import { usePhotoStore } from './usePhotoStore'

const photoStore = usePhotoStore()
</script>

<template>
  <q-dialog>
    <q-card>
      <q-card-section>
        <q-form
          class="q-gutter-y-md"
          @submit.prevent="photoStore.creator.create()"
        >
          <PhotoFormFields v-model:form="photoStore.creator.form" />

          <q-btn
            type="submit"
            label="Create"
            color="primary"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
