<script lang="ts" setup>
import { bindQTablePagination } from '../binders/bindQTablePagination'
import { toRef } from 'vue'
import { usePostStore } from './usePostStore'
import CreateDialog from './CreateDialog.vue'
import { Dialog } from 'quasar'

const postStore = usePostStore()
const {
  creator,
  updater,
  destroyer,
} = postStore

const postPagination = bindQTablePagination(toRef(updater, 'pagination'))
</script>

<template>
  <div class="column q-pa-lg q-gutter-lg">
    <q-table
      v-model:pagination="postPagination.pagination.value"
      :columns="[
        { field: 'title', label: 'Title', name: 'title', align: 'left' },
        { field: 'body', label: 'Body', name: 'body', align: 'left' },
        { field: 'delete', label: 'Delete', name: 'delete', align: 'center' },
        { field: 'edit', label: 'Edit', name: 'edit', align: 'center' },
      ]"
      :rows="updater.forms"
      @request="postPagination.onRequest"
    >
      <template #top-left>
        <q-checkbox
          v-model="postStore.autoUpdate"
          label="Auto Update"
        />
      </template>

      <template #top-right>
        <q-btn
          icon="add"
          round
          color="primary"
          @click="creator.showForm = true"
        />
      </template>

      <template #body-cell-title="{ row: { form, fields } }">
        <q-td name="title">
          <q-input
            v-model="form.title"
            borderless
            :bg-color="fields.title.changed ? 'orange-1' : undefined"
          />
        </q-td>
      </template>

      <template #body-cell-body="{ row: { form, fields } }">
        <q-td name="body">
          <q-input
            v-model="form.body"
            borderless
            :bg-color="fields.body.changed ? 'orange-1' : undefined"
          />
        </q-td>
      </template>

      <template #body-cell-delete="scope">
        <q-td
          name="delete"
          :props="scope"
        >
          <q-btn
            icon="delete"
            flat
            round
            color="negative"
            @click="Dialog.create({
              title: 'Are you sure?',
              message: `Delete '${scope.row.form.title}'`,
              cancel: true,
            }).onOk(async () => {
              await destroyer.destroy(scope.row.id)
            })"
          />
        </q-td>
      </template>

      <template #body-cell-edit="scope">
        <q-td
          name="edit"
          :props="scope"
        >
          <q-btn
            icon="edit"
            flat
            round
            color="blue"
            @click="updater.showFormId = scope.row.id"
          />
        </q-td>
      </template>
    </q-table>

    <div class="row q-row-gutter-md">
      <div>
        <q-card>
          <q-card-section class="q-gutter-y-sm">
            <h6 class="q-my-none">
              Create
            </h6>

            <q-input
              v-model="creator.form.title"
              label="Title"
              filled
            />
            <q-input
              v-model="creator.form.body"
              label="Body"
              filled
            />
            <q-btn
              label="Create"
              color="primary"
              @click="creator.create()"
            />
          </q-card-section>
        </q-card>
      </div>

      <div>
        <q-card>
          <q-card-section class="q-gutter-y-sm">
            <h6 class="q-my-none">
              Update Or Create
            </h6>

            <q-input
              v-model="creator.form.title"
              label="Title"
              filled
            />
            <q-input
              v-model="creator.form.body"
              label="Body"
              filled
            />
            <q-btn
              label="Update or Create"
              color="primary"
              @click="postStore.updateOrCreate({ title: { equals: creator.form.title } }, creator.form)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <pre>{{ updater.showFormId }}</pre>

    <q-dialog :model-value="!!updater.showFormId">
      <q-card v-if="updater.form">
        <q-card-section>
          <q-form @submit.prevent="updater.update()">
            <q-input
              v-model="updater.form.title"
              label="title"
            />

            <q-input
              v-model="updater.form.body"
              label="body"
            />

            <q-btn
              type="submit"
              label="Update"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <CreateDialog v-model="creator.showForm" />
  </div>
</template>

<style scoped>
label {
  display: flex;
  flex-direction: column;
}
</style>
