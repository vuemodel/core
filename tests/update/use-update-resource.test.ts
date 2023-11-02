import { describe, beforeEach, it, expect } from 'vitest'
import { createResource, createVueModel, findResource, useUpdateResource } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { Post } from 'sample-data'
import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import { clear as clearStorage } from 'localforage'

describe('useUpdateResource', () => {
  beforeEach(() => {
    clearStorage()
    const app = createApp({})

    const piniaLocalStorage = createPiniaLocalStorage()
    const vueModel = createVueModel({
      default: 'local',
      drivers: { local: piniaLocalVueModelDriver },
    })

    app.use(createPinia())
    app.use(vueModel)
    app.use(piniaLocalStorage)
  })

  it('updates the record in the store after update()', async () => {

  })

  it('does not update the record in the store after update() when "persist" is false', async () => {

  })

  it('can update a resource by the "id" provided to update()', async () => {

  })

  it('can update a resource by the "id" provided to update(Resource, { id })', async () => {

  })

  it('can discover the id by retrieving it from the form', async () => {

  })

  it('uses the correct precedence when updating by id', async () => {
    // updater.update(form, id) -> options.id -> options.form.value.id
  })

  it('throws an error if the id cannot be discovered', async () => {

  })

  it('can use a provided form to update', async () => {
    //
  })

  it('can make the form with a provided id, where the record does not exist in state', async () => {
    //
  })

  it('can make the form with a provided id, where the record exists in state', async () => {
    //
  })

  it('hits the "onSuccess" callback on success', async () => {
    //
  })

  it('can skip persisting to the store', async () => {
    //
  })

  it('has an "updating" value of true while updating', async () => {
    //
  })

  it('has a "findingRecordForUpdate" value of true while finding the record that will be update', async () => {
    //
  })

  it('can access the record after updating it', async () => {
    //
  })

  it('can auto update', async () => {
    //
  })

  it('can auto update with a debouncer', async () => {
    //
  })

  it('can optimistically update', async () => {
    //
  })

  it('rolls back if the update fails when using optimistic', async () => {
    //
  })

  it('sets validation errors when the response has validation errors', async () => {
    //
  })

  it('clears validation errors when a request is made', async () => {
    //
  })

  it('sets standard errors when the response has standard errors', async () => {
    //
  })

  it('clears standard errors when a request is made', async () => {
    //
  })

  it('sets validation errors when the response has validation errors', async () => {
    //
  })

  it('clears validation errors when a request is made', async () => {
    //
  })

  it('sets standard errors when the response has standard errors', async () => {
    //
  })

  it('clears standard errors when a request is made', async () => {
    //
  })

  it('success and error responses have an "action" of "update"', async () => {
    //
  })
})
