<script lang="ts" setup>
import { useBulkUpdater } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import PhotoCarousel from './PhotoCarousel.vue'
import { clearIndexedDb } from '../clearIndexedDb'
import { ref } from 'vue'

const usersBulkUpdater = useBulkUpdater(User, {
  autoUpdate: true,
  indexer: {
    with: {
      albums: {
        user: {},
        photos: {
          tags: {},
        },
      },
    },
  },
  pagination: { recordsPerPage: 3 },
  immediatelyMakeForms: true,
})

async function seed () {
  await clearIndexedDb()
  await Promise.all([
    populateRecords('photos', 30),
    populateRecords('tags'),
    populateRecords('photo_tags', 30),
    populateRecords('albums', 10),
    populateRecords('users', 3),
  ])
  await Promise.all([
    usersBulkUpdater.index(),
  ])
  await usersBulkUpdater.makeForms()
}

const selectedUserTab = ref<string>()
const selectedAlbumTab = ref<string>()
</script>

<template>
  <div class="row">
    <div class="col-12">
      <q-btn
        label="Seed Data"
        @click="seed()"
      />
    </div>

    <q-tabs
      v-model="selectedUserTab"
      class="col-12"
    >
      <q-tab
        v-for="userForm in usersBulkUpdater.forms.value"
        :key="userForm.id"
        :name="userForm.id"
      >
        <div class="row items-center">
          {{ userForm.form.name }} <q-spinner
            v-if="userForm.updating"
            class="q-ml-sm"
            color="primary"
          />
        </div>
        <q-menu context-menu>
          <q-input
            v-model="userForm.form.name"
            autofocus
            dense
            filled
            label="User Name"
          />
        </q-menu>
      </q-tab>
    </q-tabs>

    <!-- Select User -->
    <q-tab-panels v-model="selectedUserTab">
      <q-tab-panel
        v-for="userForm in usersBulkUpdater.forms.value"
        :key="userForm.id"
        :name="userForm.id"
        :label="userForm.form.name"
        class="col-4"
      >
        <q-tabs
          v-model="selectedAlbumTab"
          class="col-12"
        >
          <q-tab
            v-for="albumForm in userForm.albums_forms"
            :key="albumForm.id"
            :name="albumForm.id"
            :label="albumForm.form.title"
          />
        </q-tabs>

        <!-- Select Album -->
        <q-tab-panels v-model="selectedAlbumTab">
          <q-tab-panel
            v-for="albumForm in userForm.albums_forms"
            :key="albumForm.id"
            :name="albumForm.id"
            :label="albumForm.form.title"
          >
            <q-card-section>
              <q-card
                bordered
                flat
              >
                <q-card-section>
                  <q-input
                    v-if="albumForm.form"
                    v-model="albumForm.form.title"
                    label="Album Title"
                    filled
                  />

                  <q-select
                    v-model="albumForm.form.user_id"
                    :options="usersBulkUpdater.records.value"
                    option-label="name"
                    option-value="id"
                    emit-value
                    map-options
                  />

                  <q-card
                    bordered
                    flat
                  >
                    <q-card-section>
                      <PhotoCarousel
                        v-if="albumForm.photos_forms?.length"
                        :photo-forms="albumForm.photos_forms"
                      />
                    </q-card-section>
                  </q-card>
                </q-card-section>
              </q-card>
            </q-card-section>

            <q-card-section>
              <q-input
                v-if="albumForm.user_form.form"
                v-model="albumForm.user_form.form.email"
              />
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
