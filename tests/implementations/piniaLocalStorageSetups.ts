import { createPiniaLocalStorage, piniaLocalStorageState, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { ImplementationSetups } from './implementationSetupsMap'
import { useRepo } from 'pinia-orm'
import { Album, Comment, Photo, Post, User, populateRecords } from '@vuemodel/sample-data'
import { createPinia } from 'pinia'
import 'fake-indexeddb/auto'
import { clear as clearStorage } from 'idb-keyval'

export const piniaLocalStorageSetups: ImplementationSetups = {
  populateRecords: async (entityName, numberOfRecords) => {
    await populateRecords(entityName, numberOfRecords)
  },

  implementation: piniaLocalVueModelDriver,

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
    await clearStorage()

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
