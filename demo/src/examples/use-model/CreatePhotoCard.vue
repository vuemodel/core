<script lang="ts" setup>
import PhotoFormFields from './PhotoFormFields.vue'
import { usePhotoStore } from './UseModel.vue'

const photoStore = usePhotoStore()
const {
  creator,
} = photoStore
</script>

<template>
  <q-card>
    <q-card-section class="q-gutter-y-sm">
      <h6 class="q-my-none">
        Create Photo
      </h6>

      <q-form
        class="q-gutter-y-sm"
      >
        <PhotoFormFields v-model:form="creator.form" />

        <div class="q-gutter-md q-mt-sm">
          <q-btn
            label="Create"
            color="primary"
            :loading="creator.creating"
            @click="creator.create()"
          />
          <q-btn
            label="Update Or Create"
            outline
            :loading="photoStore.updater.updating || photoStore.creator.creating"
            @click="photoStore.updateOrCreate({ title: { equals: creator.form.title } }, creator.form)"
          >
            <q-tooltip>
              If "Title" already used, update
            </q-tooltip>
          </q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
