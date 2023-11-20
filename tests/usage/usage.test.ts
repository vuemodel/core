import { describe, beforeEach, it, expect } from 'vitest'
import { useCreator, useDestroyer, useFinder, useIndexer, useUpdater } from '@vuemodel/core'
import { User } from '@vuemodel/sample-data'
import { baseSetup } from '../baseSetup'
import 'fake-indexeddb/auto'

describe('find', () => {
  beforeEach(async () => {
    await baseSetup()
  })

  it('can pass the driver as the first param when using any of the CRUD composables', async () => {
    const userCreator = useCreator('local', User, { persist: false, form: { id: '1' } })
    const userFinder = useFinder('local', User, { persist: true })
    const userUpdater = useUpdater('local', User)
    const userDestroyer = useDestroyer('local', User)
    const userIndexer = useIndexer('local', User, {})

    await userCreator.create({ name: 'lugu' })
    expect(userCreator.record.value).toEqual(null)
    await userFinder.find('1')
    expect(userFinder.record.value.id).toEqual('1')
    await userUpdater.update({ id: '1', name: 'engatoo' })
    expect(userUpdater.record.value.name).toEqual('engatoo')
    await userDestroyer.destroy('1')
    expect(userDestroyer.record.value.name).toEqual('engatoo')
    expect(userUpdater.record.value).toEqual(null)
    await userIndexer.index()
    expect(userIndexer.records.value.length).toEqual(0)
  })

  it('throws an error when trying to use a driver that does not exist', async () => {
    // Unfortunately, we don't currently have a driver for a server on Mars 😞

    expect(() => {
      useCreator('mars', User, {})
    }).toThrowError('No driver installed')

    expect(() => {
      useFinder('mars', User, {})
    }).toThrowError('No driver installed')

    expect(() => {
      useUpdater('mars', User, {})
    }).toThrowError('No driver installed')

    expect(() => {
      useDestroyer('mars', User, {})
    }).toThrowError('No driver installed')

    expect(() => {
      useIndexer('mars', User, {})
    }).toThrowError('No driver installed')
  })
})
