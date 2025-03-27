import 'fake-indexeddb/auto'
import { createPiniaLocalStorage, deleteDatabases, piniaLocalStorageState, piniaLocalVueModelDriver } from '@vuemodel/indexeddb'
import { DriverSetups } from './driverSetupsMap'
import { useRepo } from 'pinia-orm'
import { Album, Comment, Photo, Post, User, populateRecords } from '@vuemodel/sample-data'
import { createPinia } from 'pinia'

export const piniaLocalStorageSetups: DriverSetups = {
  populateRecords: async (entityName, numberOfRecords) => {
    await populateRecords(entityName, numberOfRecords)
  },

  driver: piniaLocalVueModelDriver,

  async setMockLatency (ms: number) {
    piniaLocalStorageState.mockLatencyMs = ms
  },

  async setMockValidationErrors (mockValidationErrors) {
    piniaLocalStorageState.mockValidationErrors = mockValidationErrors
  },

  async setMockStandardErrors (mockStandardErrors) {
    piniaLocalStorageState.mockStandardErrors = mockStandardErrors
  },

  async baseSetup (app, context) {
    await deleteDatabases('testDriver')

    piniaLocalStorageState.mockStandardErrors = undefined
    piniaLocalStorageState.mockValidationErrors = undefined
    piniaLocalStorageState.mockLatencyMs = 0

    const piniaBack = createPinia()
    const piniaLocalStorage = createPiniaLocalStorage({
      frontStore: context.piniaFront,
      backStore: piniaBack,
    })

    app.use(piniaLocalStorage)

    const backRepoUser = useRepo(User, piniaBack)
    const backRepoComment = useRepo(Comment, piniaBack)
    const backRepoPhoto = useRepo(Photo, piniaBack)
    const backRepoPost = useRepo(Post, piniaBack)
    const backRepoAlbum = useRepo(Album, piniaBack)

    backRepoUser.flush()
    backRepoComment.flush()
    backRepoPhoto.flush()
    backRepoPost.flush()
    backRepoAlbum.flush()
  },
}
