import { createVueModel, vueModelState } from '@vuemodel/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { piniaLocalStorageState, createPiniaLocalStorage, piniaLocalVueModelDriver } from '@vuemodel/pinia-local-storage'
import { clear as clearStorage } from 'idb-keyval'
import { Album, Comment, Photo, Post, User } from '@vuemodel/sample-data'
import { createORM, useRepo } from 'pinia-orm'
import 'fake-indexeddb/auto'

export async function baseSetup () {
  await clearStorage()
  piniaLocalStorageState.mockStandardErrors = undefined
  piniaLocalStorageState.mockValidationErrors = undefined
  piniaLocalStorageState.mockLatencyMs = 0

  const piniaOrm = createORM()
  const piniaFront = createPinia()
  const piniaBack = createPinia()

  piniaFront.use(piniaOrm)
  const piniaLocalStorage = createPiniaLocalStorage({
    frontStore: piniaFront,
    backStore: piniaBack,
  })
  const vueModel = createVueModel({
    default: 'local',
    drivers: { local: { ...piniaLocalVueModelDriver, config: { pinia: piniaFront } } },
  })

  const app = createApp({})

  app.use(piniaFront)
  app.use(vueModel)
  app.use(piniaLocalStorage)
  app.use(piniaOrm)

  const frontRepoUser = useRepo(User, piniaFront)
  const frontRepoComment = useRepo(Comment, piniaFront)
  const frontRepoPhoto = useRepo(Photo, piniaFront)
  const frontRepoPost = useRepo(Post, piniaFront)
  const frontRepoAlbum = useRepo(Album, piniaFront)

  const backRepoUser = useRepo(User, piniaBack)
  const backRepoComment = useRepo(Comment, piniaBack)
  const backRepoPhoto = useRepo(Photo, piniaBack)
  const backRepoPost = useRepo(Post, piniaBack)
  const backRepoAlbum = useRepo(Album, piniaBack)

  frontRepoUser.flush()
  frontRepoComment.flush()
  frontRepoPhoto.flush()
  frontRepoPost.flush()
  frontRepoAlbum.flush()

  backRepoUser.flush()
  backRepoComment.flush()
  backRepoPhoto.flush()
  backRepoPost.flush()
  backRepoAlbum.flush()

  vueModelState.config.pagination = {}
  vueModelState.drivers.local.config.pagination = {}
  vueModelState.drivers.local.config.scopes = {}
  vueModelState.config.globallyAppliedScopes = undefined
  vueModelState.config.globallyAppliedEntityScopes = undefined
  vueModelState.drivers.local.config.globallyAppliedScopes = undefined
  vueModelState.drivers.local.config.globallyAppliedEntityScopes = undefined
  vueModelState.config.scopes = undefined
  vueModelState.config.entityScopes = undefined
}
