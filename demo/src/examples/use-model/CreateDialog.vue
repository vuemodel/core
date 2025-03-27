<script lang="ts" setup>
import { usePostStore } from './usePostStore'

const postStore = usePostStore()
</script>

<template>
  <q-dialog>
    <q-card>
      <q-card-section>
        <q-form
          class="q-gutter-y-md"
          @submit.prevent="postStore.creator.create()"
        >
          <q-input
            v-model="postStore.creator.form.title"
            label="Title"
            filled
          />
          <q-input
            v-model="postStore.creator.form.body"
            type="textarea"
            label="Body"
            filled
          />
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
