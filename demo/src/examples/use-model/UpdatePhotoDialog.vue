<script lang="ts" setup>
import PhotoFormFields from './PhotoFormFields.vue'
import { usePhotoStore } from './UseModel.vue'

const photoStore = usePhotoStore()
const {
  creator,
  updater,
} = photoStore
</script>

<template>
  <q-dialog
    :model-value="!!updater.showFormId"
    @hide="updater.showFormId = ''"
  >
    <q-card v-if="updater.form">
      <q-card-section>
        <q-form>
          <PhotoFormFields v-model:form="updater.form" />

          <q-btn
            label="Update"
            @click="updater.update()"
          />

          <q-btn
            label="Update Or Create"
            @click="photoStore.updateOrCreate({ title: { equals: creator.form.title } }, creator.form)"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
