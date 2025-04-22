<script lang="ts" setup>
import { bindQTablePagination } from '../binders/bindQTablePagination'
import { toRef } from 'vue'
import { usePhotoStore } from './usePhotoStore'
import CreateDialog from './CreateDialog.vue'
import { Dialog } from 'quasar'
import { Tag } from '@vuemodel/sample-data'
import PhotoFormFields from './PhotoFormFields.vue'
import { useAlbumsIndexer } from './useAlbumsIndexer'
import { useTagsIndexer } from './useTagsIndexer'
import { mdiRefresh, mdiUpload } from '@quasar/extras/mdi-v7'

const photoStore = usePhotoStore()
const {
  creator,
  updater,
  destroyer,
} = photoStore

const albumsIndexer = useAlbumsIndexer()
const tagsIndexer = useTagsIndexer()

const photoPagination = bindQTablePagination(toRef(updater, 'pagination'))
</script>

<template>
  <div class="column q-pa-lg q-gutter-lg">
    <q-table
      v-model:pagination="photoPagination.pagination.value"
      :loading="photoStore.indexer.indexing"
      title="photos"
      :columns="[
        { field: 'title', label: 'Title', name: 'title', align: 'left' },
        { field: 'url', label: 'URL', name: 'url', align: 'left' },
        { field: row => row.album?.title, label: 'Album', name: 'album', align: 'left' },
        { field: row => row.tags?.map((tag: Tag) => tag.name).join(', '), label: 'Tag', name: 'tag', align: 'left' },
        { field: 'delete', label: 'Delete', name: 'delete', align: 'center' },
        { field: 'edit', label: 'Edit', name: 'edit', align: 'center' },
      ]"
      :rows="updater.forms"
      @request="photoPagination.onRequest"
    >
      <template #top-left>
        <q-checkbox
          v-model="photoStore.autoUpdate"
          label="Auto Update"
        />
      </template>

      <template #top-right>
        <q-btn
          class="q-mr-sm"
          :icon="mdiRefresh"
          round
          color="secondary"
          :loading="photoStore.indexer.indexing"
          @click="photoStore.indexer.index()"
        />

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

      <template #body-cell-url="{ row: { form, fields } }">
        <q-td name="url">
          <q-input
            v-model="form.url"
            borderless
            :bg-color="fields.url.changed ? 'orange-1' : undefined"
          />
        </q-td>
      </template>

      <template #body-cell-album="{ row: { form, fields } }">
        <q-td name="album">
          <q-select
            v-model="form.album_id"
            emit-value
            map-options
            option-label="title"
            option-value="id"
            :options="albumsIndexer.records"
            borderless
            :bg-color="fields.album_id.changed ? 'orange-1' : undefined"
          />
        </q-td>
      </template>

      <template #body-cell-tag="scope">
        <q-td name="tag">
          <q-select
            v-model="scope.row.form.tags"
            :loading="scope.row.fields.tags.updating"
            :options="tagsIndexer.records"
            option-label="name"
            multiple
            option-value="id"
            emit-value
            use-chips
            map-options
            label="Tags"
            borderless
            :bg-color="scope.row.fields?.tags?.changed ? 'orange-1' : undefined"
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

      <template #bottom>
        <q-btn
          v-if="!photoStore.updater.forms.findIndex(form => form.changed)"
          label="Persist Changes"
          no-caps
          :icon="mdiUpload"
          @click="photoStore.updater.update()"
        />
      </template>
    </q-table>

    <div class="row q-row-gutter-md">
      <div>
        <q-card>
          <q-card-section class="q-gutter-y-sm">
            <h6 class="q-my-none">
              Create
            </h6>

            <q-form
              class="q-gutter-y-sm"
              @submit.prevent="creator.create()"
            >
              <PhotoFormFields v-model:form="creator.form" />

              <q-btn
                label="Create"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div>
        <q-card>
          <q-card-section class="q-gutter-y-sm">
            <h6 class="q-my-none">
              Update Or Create
            </h6>

            <q-form
              class="q-gutter-y-sm"
              @submit.prevent="photoStore.updateOrCreate({ title: { equals: creator.form.title } }, creator.form)"
            >
              <PhotoFormFields v-model:form="creator.form" />

              <q-btn
                label="Update or Create"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog
      :model-value="!!updater.showFormId"
      @hide="updater.showFormId = ''"
    >
      <q-card v-if="updater.form">
        <q-card-section>
          <q-form @submit.prevent="updater.update()">
            <PhotoFormFields v-model:form="updater.form" />

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
