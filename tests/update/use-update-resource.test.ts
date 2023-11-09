import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest'
import { baseSetup } from '../baseSetup'
import { populateRecords } from '../helpers/populateRecords'
import { UseUpdateResourceOptions, useIndexResources, useUpdateResource, vueModelState } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { piniaLocalStorageState } from '@vuemodel/pinia-local-storage'
import { ref } from 'vue'
import { wait } from '../helpers/wait'
import { clear as clearStorage } from 'idb-keyval'

describe('useUpdateResource', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  afterEach(async () => {
    await clearStorage()
  })

  it('updates the record in the store after update()', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User)
    await updater.update('1', { name: 'John Smithio' })
    // console.log(updater.record.value)

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(id)', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User)
    updater.form.value.name = 'John Smithio'
    await updater.update('1')

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(id, form)', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User)
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(form)', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User, { id: '1' })
    await updater.update({ name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('does not update the record in the store after update() when "persist" is false', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User, { persist: false })
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).not.toEqual('John Smithio')
  })

  it('has highest precedence for id from "updater.update(id)"', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdateResource(User, { id: '2' })
    updater.form.value.id = '4'
    await updater.update('1', { name: 'jenny', id: '3' })

    expect(userRepo.find('1')).toHaveProperty('name', 'jenny')
  })

  it('has second highest precedence for id from "options.id"', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdateResource(User, { id: '2' })
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny', id: '3' })

    expect(userRepo.find('2')).toHaveProperty('name', 'jenny')
  })

  it('has third highest precedence for id from "formParam.id"', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdateResource(User)
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny', id: '3' })

    expect(userRepo.find('3')).toHaveProperty('name', 'jenny')
  })

  it('has fourth highest precedence for id from "options.form.value.id"', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdateResource(User)
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny' })

    expect(userRepo.find('4')).toHaveProperty('name', 'jenny')
  })

  it('can make the form with a provided id, when the record does not exist in state, by fetching it from the backend', async () => {
    await populateRecords('users', 5)

    const updater = useUpdateResource(User)
    const updatePromise = updater.makeForm('2')

    expect(updater.form.value).not.toMatchObject({
      id: '2',
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      phone: '010-692-6593 x09125',
      website: 'anastasia.net',
      age: 41,
    })

    await updatePromise
    expect(updater.form.value).toMatchObject({
      id: '2',
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      phone: '010-692-6593 x09125',
      website: 'anastasia.net',
      age: 41,
    })
  })

  it('can make the form with a provided id, where the record exists in state', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 50

    const updater = useUpdateResource(User)
    updater.makeForm('2')

    expect(updater.form.value).toMatchObject({
      id: '2',
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      phone: '010-692-6593 x09125',
      website: 'anastasia.net',
      age: 41,
    })
  })

  it('can immediately make the form whenever the id changes', async () => {
    await populateRecords('users', 5)
    await useIndexResources(User).index()

    const id = ref('1')
    const updater = useUpdateResource(User, { immediatelyMakeForm: true, id })

    await vi.waitUntil(() => {
      return updater.form.value.name === 'Leanne Graham'
    })
    id.value = '2'
    await vi.waitUntil(() => {
      return updater.form.value.name === 'Ervin Howell'
    })
    id.value = '3'
    await vi.waitUntil(() => {
      return updater.form.value.name === 'Clementine Bauch'
    })
  })

  it('has a "makingForm" value set to the id of the record being used to make the form', async () => {
    await populateRecords('users', 5)

    const updater = useUpdateResource(User, {
      id: '2',
    })
    const makingFormPromise = updater.makeForm()

    expect(updater.makingForm.value).toEqual('2')
    await makingFormPromise
    expect(updater.makingForm.value).toEqual(undefined)
  })

  it('hits the "onSuccess" callback on success', async () => {
    await populateRecords('users', 5)

    const options: UseUpdateResourceOptions<typeof User> = {
      id: '2',
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const updater = useUpdateResource(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    const options: UseUpdateResourceOptions<typeof User> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const updater = useUpdateResource(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }

    const options: UseUpdateResourceOptions<typeof User> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const updater = useUpdateResource(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]
    const options: UseUpdateResourceOptions<typeof User> = {
      id: '2',
      onStandardError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onStandardError')

    const updater = useUpdateResource(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }
    const options: UseUpdateResourceOptions<typeof User> = {
      id: '2',
      onValidationError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onValidationError')

    const updater = useUpdateResource(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('updates a record and inserts it into the store. Even if it was not originally in the store', async () => {
    await populateRecords('users', 2)

    const updater = useUpdateResource(User)
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can skip persisting to the store', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User, { persist: false })
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('Leanne Graham')
  })

  it('has an "updating" value set to the id of the record while updating', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()

    const updater = useUpdateResource(User, { persist: false })
    const updatePromise = updater.update('2', { name: 'John Smithio' })

    expect(updater.updating.value).toEqual('2')
    await updatePromise
    expect(updater.updating.value).toEqual(undefined)
  })

  it('has a "findingRecordForUpdate" value of true while finding the record that will be update', async () => {
    await populateRecords('users', 2)

    const updater = useUpdateResource(User, { id: '2' })
    const makingFormPromise = updater.makeForm()

    expect(updater.makingForm.value).toEqual('2')
    await makingFormPromise
    expect(updater.makingForm.value).toEqual(undefined)
  })

  it('can access "updater.record" after updating a record', async () => {
    await populateRecords('users', 2)

    const updater = useUpdateResource(User, { id: '1' })
    await updater.update({
      name: 'Lugu Engatoo',
      email: 'lugu@love-the-standard.com',
    })

    expect(updater.record.value).toMatchObject({
      id: '1',
      name: 'Lugu Engatoo',
      username: 'Bret',
      email: 'lugu@love-the-standard.com',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
      age: 27,
    })
  })

  it('can auto update', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 50

    const updater = useUpdateResource(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 50 })
    updater.form.value.name = 'Lily Diebold'

    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 150 })
    expect(updater.updating.value).toEqual('2')
  })

  it('can auto update with a debouncer', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 100

    const updater = useUpdateResource(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 150 })
    updater.form.value.name = 'lu'
    expect(updater.updating.value).toEqual(undefined)
    updater.form.value.name = 'lugu'
    expect(updater.updating.value).toEqual(undefined)

    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has highest precedence for autoUpdateDebounce from "updater.options.autoUpdateDebounce"', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 300

    vueModelState.drivers.local.config.autoUpdateDebounce = 50
    vueModelState.config.autoUpdateDebounce = 50

    const updater = useUpdateResource(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 300 })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has second highest precedence for autoUpdateDebounce from "config.drivers.{driver}.config.autoUpdateDebounce"', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 300

    vueModelState.drivers.local.config.autoUpdateDebounce = 300
    vueModelState.config.autoUpdateDebounce = 50

    const updater = useUpdateResource(User, { id: '2', autoUpdate: true })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has lowest precedence for autoUpdateDebounce from "config.autoUpdateDebounce"', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 300

    vueModelState.config.autoUpdateDebounce = 300

    const updater = useUpdateResource(User, { id: '2', autoUpdate: true })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500 })
    expect(updater.updating.value).toEqual('2')
  })

  it('can optimistically update', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 50

    const userUpdater = useUpdateResource(User, { id: '2', optimistic: true })

    userUpdater.update({ name: 'Ross' }) // intentionally not awaited

    expect(userUpdater.record.value?.name).toEqual('Ross')
  })

  it('rolls back if the update fails when using optimistic', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    piniaLocalStorageState.mockLatencyMs = 50
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]
    const userRepo = useRepo(User)

    const userUpdater = useUpdateResource(User, { id: '2', optimistic: true })

    const updatePromise = userUpdater.update({ name: 'Ross' }) // intentionally not awaited

    // Assumes success
    expect(userUpdater.record.value?.name).toEqual('Ross')

    await updatePromise
    // Then hits error, and rollback occurs
    expect(userRepo.find('2').name).not.toEqual('Ross')
    expect(userRepo.find('2').name).toEqual('Ervin Howell')
  })

  it('sets validation errors when the response has validation errors', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    const userUpdater = useUpdateResource(User, { id: '2' })
    piniaLocalStorageState.mockValidationErrors = {
      title: ['title is required'],
    }

    await userUpdater.update({ name: 'lugu' })

    expect(userUpdater.validationErrors.value.title)
      .toEqual(expect.arrayContaining(['title is required']))
  })

  it('clears validation errors when a request is made', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    const userUpdater = useUpdateResource(User, { id: '2' })
    piniaLocalStorageState.mockValidationErrors = {
      name: ['name is required'],
    }

    await userUpdater.update({ name: 'lugu' })

    expect(userUpdater.validationErrors.value.name)
      .toEqual(expect.arrayContaining(['name is required']))

    piniaLocalStorageState.mockValidationErrors = undefined
    await userUpdater.update({ name: 'engatoo' })

    expect(Object.values(userUpdater.validationErrors.value).length)
      .toEqual(0)
  })

  it('sets standard errors when the response has standard errors', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    const userUpdater = useUpdateResource(User, { id: '2' })
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await userUpdater.update({ name: 'Sir Johnalot' })

    expect(userUpdater.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })
  })

  it('clears standard errors when a request is made', async () => {
    await populateRecords('users', 2)
    await useIndexResources(User).index()
    const userUpdater = useUpdateResource(User, { id: '2' })
    piniaLocalStorageState.mockStandardErrors = [
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ]

    await userUpdater.update({ name: 'Sir Johnalotington' })

    expect(userUpdater.standardErrors.value[0])
      .toEqual({ name: 'thingy-messup', message: 'The thingy messed up' })

    piniaLocalStorageState.mockStandardErrors = undefined
    await userUpdater.update()

    expect(userUpdater.standardErrors.value.length)
      .toEqual(0)
  })

  it('success and error responses have an "action" of "update"', async () => {
    await populateRecords('users', 2)
    const userUpdater = useUpdateResource(User, { id: '2' })
    piniaLocalStorageState.mockStandardErrors = [{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }]

    await userUpdater.update({ name: 'Smelly' })

    expect(userUpdater.response.value.action)
      .toEqual('update')

    piniaLocalStorageState.mockStandardErrors = []
    await userUpdater.update({ name: 'Elly' })

    expect(userUpdater.response.value.action)
      .toEqual('update')
  })

  it('returns a standard error if an ID cannot be discovered', async () => {
    await populateRecords('users', 2)
    const userUpdater = useUpdateResource(User, { id: '3' })

    await userUpdater.update()

    expect(userUpdater.standardErrors.value[0].message).toContain('3')
  })

  it('cancels other "making" requests when a new "making" request is made', async () => {
    //
  })
})
