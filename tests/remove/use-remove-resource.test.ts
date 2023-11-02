import { describe, beforeEach, it } from 'vitest'
import { createVueModel } from '@vuemodel/core'
import { createPiniaLocalStorage, piniaLocalStorageState, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clear as clearStorage } from 'localforage'
import { baseSetup } from '../baseSetup'

describe('useRemoveResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('removes the record from the store after remove()', async () => {
    //
  })

  it('does not remove the record from the store after remove() when "persis" is false', async () => {
    //
  })

  it('can remove a resource by the "id"', async () => {
    //
  })

  it('uses the correct precedence when removing by id', async () => {
    // remover.remove(id) -> options.id
  })

  it('can skip persisting to the store', async () => {
    //
  })

  it('has a "removing" value of true while removing', async () => {
    //
  })

  it('can access the record after removing it', async () => {
    //
  })

  it('hits the "onSuccess" callback on success', async () => {
    //
  })

  it('can optimistically remove', async () => {
    //
  })

  it('rolls back if the remove fails when using optimistic', async () => {
    //
  })

  it('sets standard errors when the response has standard errors', async () => {
    //
  })

  it('clears standard errors when a request is made', async () => {
    //
  })

  it('success and error responses have an "action" of "remove"', async () => {
    //
  })
})
