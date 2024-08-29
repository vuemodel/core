import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest'
import { baseSetup } from '../baseSetup'
import { UseUpdaterOptions, useIndexer, useUpdater, vueModelState } from '@vuemodel/core'
import { DataverseUser, PhotoTag, User, populateRecords } from '@vuemodel/sample-data'
import { useRepo } from 'pinia-orm'
import { ref } from 'vue'
import { wait } from '../helpers/wait'
import { clear as clearStorage } from 'idb-keyval'
import { driverSetupsMap } from '../drivers/driverSetupsMap'

const setups = driverSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

describe('useUpdater', () => {
  beforeEach(async (ctx) => {
    await baseSetup(ctx)
  })

  afterEach(async () => {
    await clearStorage()
  })

  it('updates the record in the store after update()', async () => {
    await setups.populateRecords('users', 2)
    const indexer = useIndexer(User)
    await indexer.index()

    const updater = useUpdater(User)
    await updater.update('1', { name: 'John Smithio', email: 'john@smithio.com' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(id)', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User)
    updater.form.value.name = 'John Smithio'
    await updater.update('1')

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(id, form)', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User)
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update with signature update(form)', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User, { id: '1' })
    await updater.update({ name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('does not update the record in the store after update() when "persist" is false', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User, { persist: false })
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).not.toEqual('John Smithio')
  })

  it('has highest precedence for id from "updater.update(id)"', async () => {
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdater(User, { id: '2' })
    updater.form.value.id = '4'
    await updater.update('1', { name: 'jenny', id: '3' })

    expect(userRepo.find('1')).toHaveProperty('name', 'jenny')
  })

  it('has second highest precedence for id from "options.id"', async () => {
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdater(User, { id: '2' })
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny', id: '3' })

    expect(userRepo.find('2')).toHaveProperty('name', 'jenny')
  })

  it('has third highest precedence for id from "formParam.id"', async () => {
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdater(User)
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny', id: '3' })

    expect(userRepo.find('3')).toHaveProperty('name', 'jenny')
  })

  it('has fourth highest precedence for id from "options.form.value.id"', async () => {
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()
    const userRepo = useRepo(User)

    const updater = useUpdater(User)
    updater.form.value.id = '4'
    await updater.update({ name: 'jenny' })

    expect(userRepo.find('4')).toHaveProperty('name', 'jenny')
  })

  it('can make the form with a provided id, when the record does not exist in state, by fetching it from the backend', async () => {
    await setups.populateRecords('users', 5)

    const updater = useUpdater(User)
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
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()
    setups.setMockLatency(50)

    const updater = useUpdater(User)
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
    await setups.populateRecords('users', 5)
    await useIndexer(User).index()

    const id = ref('1')
    const updater = useUpdater(User, { immediatelyMakeForm: true, id })

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
    await setups.populateRecords('users', 5)

    const updater = useUpdater(User, {
      id: '2',
    })
    const makingFormPromise = updater.makeForm()

    expect(updater.makingForm.value).toEqual('2')
    await makingFormPromise
    expect(updater.makingForm.value).toEqual(false)
  })

  it('hits the "onSuccess" callback on success', async () => {
    await setups.populateRecords('users', 5)

    const options: UseUpdaterOptions<typeof User> = {
      id: '2',
      onSuccess () {
        return true
      },
    }
    const onSuccessSpy = vi.spyOn(options, 'onSuccess')

    const updater = useUpdater(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onSuccessSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a standard error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    const options: UseUpdaterOptions<typeof User> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const updater = useUpdater(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onError" callback when there is a validation error', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })

    const options: UseUpdaterOptions<typeof User> = {
      id: '2',
      onError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onError')

    const updater = useUpdater(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onStandardError" callback when there are one or more standard errors', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const options: UseUpdaterOptions<typeof User> = {
      id: '2',
      onStandardError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onStandardError')

    const updater = useUpdater(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('hits the "onValidationError" callback when there are one or more validation errors', async () => {
    setups.setMockValidationErrors({
      title: ['title is required'],
    })
    const options: UseUpdaterOptions<typeof User> = {
      id: '2',
      onValidationError () {
        return true
      },
    }
    const onErrorSpy = vi.spyOn(options, 'onValidationError')

    const updater = useUpdater(User, options)
    await updater.update('2', { name: 'beep' })

    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('updates a record and inserts it into the store. Even if it was not originally in the store', async () => {
    await setups.populateRecords('users', 2)

    const updater = useUpdater(User)
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can skip persisting to the store', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User, { persist: false })
    await updater.update('1', { name: 'John Smithio' })

    expect(updater.record.value.name).toEqual('Leanne Graham')
  })

  it('has an "updating" value set to the id of the record while updating', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()

    const updater = useUpdater(User, { persist: false })
    const updatePromise = updater.update('2', { name: 'John Smithio' })

    expect(updater.updating.value).toEqual('2')
    await updatePromise
    expect(updater.updating.value).toEqual(false)
  })

  it('has a "findingRecordForUpdate" value of true while finding the record that will be update', async () => {
    await setups.populateRecords('users', 2)

    const updater = useUpdater(User, { id: '2' })
    const makingFormPromise = updater.makeForm()

    expect(updater.makingForm.value).toEqual('2')
    await makingFormPromise
    expect(updater.makingForm.value).toEqual(false)
  })

  it('can access "updater.record" after updating a record', async () => {
    await setups.populateRecords('users', 2)

    const updater = useUpdater(User, { id: '1' })
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
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(50)

    const updater = useUpdater(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 150 })
    updater.form.value.name = 'Lily Diebold'

    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 1500, interval: 1 })
    expect(updater.updating.value).toEqual('2')
  })

  it('can auto update with a debouncer', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(100)

    const updater = useUpdater(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 150 })
    updater.form.value.name = 'lu'
    expect(updater.updating.value).toEqual(false)
    updater.form.value.name = 'lugu'
    expect(updater.updating.value).toEqual(false)

    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500, interval: 1 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has highest precedence for autoUpdateDebounce from "updater.options.autoUpdateDebounce"', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(300)

    vueModelState.drivers.testDriver.config.autoUpdateDebounce = 50
    vueModelState.config.autoUpdateDebounce = 50

    const updater = useUpdater(User, { id: '2', autoUpdate: true, autoUpdateDebounce: 300 })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500, interval: 1 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has second highest precedence for autoUpdateDebounce from "config.drivers.{driver}.config.autoUpdateDebounce"', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(300)

    vueModelState.drivers.testDriver.config.autoUpdateDebounce = 300
    vueModelState.config.autoUpdateDebounce = 50

    const updater = useUpdater(User, { id: '2', autoUpdate: true })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500, interval: 1 })
    expect(updater.updating.value).toEqual('2')
  })

  it('has lowest precedence for autoUpdateDebounce from "config.autoUpdateDebounce"', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(300)

    vueModelState.config.autoUpdateDebounce = 300

    const updater = useUpdater(User, { id: '2', autoUpdate: true })

    updater.form.value.name = 'lugu'
    await wait(200)
    expect(updater.updating.value).not.toEqual('2')
    await vi.waitUntil(() => updater.updating.value === '2', { timeout: 500, interval: 1 })
    expect(updater.updating.value).toEqual('2')
  })

  it('can optimistically update', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(50)

    const userUpdater = useUpdater(User, { id: '2', optimistic: true })

    userUpdater.update({ name: 'Ross' }) // intentionally not awaited

    expect(userUpdater.record.value?.name).toEqual('Ross')
  })

  it('can set optimistic globally', async () => {
    // await setups.populateRecords('users', 2)
    // await useIndexer(User).index()
    // setups.setMockLatency(50)

    // const userUpdater = useUpdater(User, { id: '2', optimistic: true })

    // userUpdater.update({ name: 'Ross' }) // intentionally not awaited

    // expect(userUpdater.record.value?.name).toEqual('Ross')
  })

  it('rolls back if the update fails when using optimistic', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    setups.setMockLatency(50)
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    const userRepo = useRepo(User)

    const userUpdater = useUpdater(User, { id: '2', optimistic: true })

    const updatePromise = userUpdater.update({ email: 'Ross' }) // intentionally not awaited

    // Assumes success
    expect(userUpdater.record.value?.email).toEqual('Ross')

    await updatePromise
    // Then hits error, and rollback occurs
    expect(userRepo.find('2').email).not.toEqual('Ross')
    expect(userRepo.find('2').email).toEqual('Shanna@melissa.tv')
  })

  it('sets validation errors when the response has validation errors', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    const userUpdater = useUpdater(User, { id: '2' })
    setups.setMockValidationErrors({
      email: ['please enter a valid email'],
    })

    await userUpdater.update({ email: 'lugu' })

    expect(userUpdater.validationErrors.value.email[0])
      .toBeTypeOf('string')
  })

  it('clears validation errors when a request is made', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    const userUpdater = useUpdater(User, { id: '2' })
    setups.setMockValidationErrors({
      email: ['please enter a valid email'],
    })

    await userUpdater.update({ email: 'lugu' })

    expect(userUpdater.validationErrors.value.email[0])
      .toBeTypeOf('string')

    setups.setMockValidationErrors(undefined)
    await userUpdater.update({ email: 'lugu@engatoo.com' })

    expect(Object.values(userUpdater.validationErrors.value).length)
      .toEqual(0)
  })

  it('sets standard errors when the response has standard errors', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    const userUpdater = useUpdater(User, { id: '2' })
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await userUpdater.update({ email: 'Sir Johnalot' })

    expect(userUpdater.standardErrors.value[0].message)
      .toBeTypeOf('string')
  })

  it('clears standard errors when a request is made', async () => {
    await setups.populateRecords('users', 2)
    await useIndexer(User).index()
    const userUpdater = useUpdater(User, { id: '2' })
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])

    await userUpdater.update({ email: 'Sir Johnalotington' })

    expect(userUpdater.standardErrors.value[0].message)
      .toBeTypeOf('string')

    setups.setMockStandardErrors(undefined)
    await userUpdater.update()

    expect(userUpdater.standardErrors.value.length)
      .toEqual(0)
  })

  it('success and error responses have an "action" of "update"', async () => {
    await setups.populateRecords('users', 2)
    const userUpdater = useUpdater(User, { id: '2' })
    setups.setMockStandardErrors([{
      name: 'thingy-messup',
      message: 'The thingy messed up',
    }])

    await userUpdater.update({ name: 'Smelly' })

    expect(userUpdater.response.value.action)
      .toEqual('update')

    setups.setMockStandardErrors([])
    await userUpdater.update({ name: 'Elly' })

    expect(userUpdater.response.value.action)
      .toEqual('update')
  })

  it('returns a standard error if an ID cannot be discovered', async () => {
    await setups.populateRecords('users', 2)
    const userUpdater = useUpdater(User, { id: '3' })

    await userUpdater.update()

    expect(userUpdater.standardErrors.value[0].message).toContain('3')
  })

  it('only updates the given value, not removing other fields', async () => {
    await setups.populateRecords('users', 2)
    const userUpdater = useUpdater(User, { id: '1' })

    await userUpdater.update({ name: 'Lugu' })

    expect(userUpdater.record.value.name).toEqual('Lugu')
    expect(userUpdater.record.value.username).toEqual('Bret')
  })

  it('can update a resource with a composite key', async () => {
    await setups.populateRecords('photo_tags', 10)
    const repo = useRepo(PhotoTag)
    const photoTagUpdater = useUpdater(PhotoTag, { id: ['1', '2'] })

    await photoTagUpdater.makeForm()
    await photoTagUpdater.update('["1","2"]', { tag_id: '22' })

    expect(repo.find('["1","22"]'))
      .toMatchObject({
        photo_id: '1',
        tag_id: '22',
      })
  })

  it('can pass an array to "update" to update via composite key', async () => {
    await setups.populateRecords('photo_tags', 10)
    const repo = useRepo(PhotoTag)
    const photoTagUpdater = useUpdater(PhotoTag, { id: ['1', '2'] })

    await photoTagUpdater.makeForm()
    await photoTagUpdater.update(['1', '2'], { tag_id: '22' })

    expect(repo.find('["1","22"]'))
      .toMatchObject({
        photo_id: '1',
        tag_id: '22',
      })
  })

  it('can update a resource where the primaryKey is not "id"', async () => {
    await setups.populateRecords('dataverse_users', 2)
    await useIndexer(DataverseUser).index()

    const updater = useUpdater(DataverseUser)
    updater.form.value.name = 'John Smithio'
    await updater.update('1')

    expect(updater.record.value.name).toEqual('John Smithio')
  })

  it('can update two records at the same time', async () => {
    await setups.populateRecords('users', 2)
    const postRepo = useRepo(User)
    const postUpdater = useUpdater(User)

    const updateRequestA = postUpdater.update('1', { name: 'Good Ol User' })
    await wait(50)
    const updateRequestB = postUpdater.update('2', { name: 'Lugus User' })

    await Promise.all([updateRequestA, updateRequestB])

    expect(postRepo.all().length).toEqual(2)
    expect(postRepo.all().map(record => record.name))
      .toEqual(['Good Ol User', 'Lugus User'])
    expect(postUpdater.record.value.name).toEqual('Lugus User')
  })

  it('can cancel the latest request', async () => {
    await setups.populateRecords('users', 1)
    const repo = useRepo(User)
    setups.setMockLatency(100)

    const usersUpdater = useUpdater(User)
    await usersUpdater.makeForm('1')
    const updateRequest = usersUpdater.update('1', { name: 'lugu' })
    usersUpdater.cancel()
    await updateRequest

    expect(usersUpdater.standardErrors.value[0].message)
      .toContain('abort')
    expect(repo.find('1'))
      .not.toMatchObject({ name: 'lugu' })
    expect(repo.find('1'))
      .toMatchObject({ name: 'Leanne Graham' })
  })

  it('can notify on error', async () => {
    setups.setMockStandardErrors([
      { name: 'thingy-messup', message: 'The thingy messed up' },
    ])
    vueModelState.config.errorNotifiers = {
      update: () => {
        return ''
      },
    }

    const updateErrorNotifierSpy = vi.spyOn(vueModelState.config.errorNotifiers, 'update')

    const postUpdater = useUpdater(User, { notifyOnError: true })
    await postUpdater.update('1', { name: 'Ann' })

    expect(updateErrorNotifierSpy).toHaveBeenCalled()
  })
})
