import { createVueModel, vueModelState } from '@vuemodel/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { Album, Comment, Photo, Post, User } from '@vuemodel/sample-data'
import { createORM, useRepo } from 'pinia-orm'
import { implementationSetupsMap } from './implementations/implementationSetupsMap'

const setups = implementationSetupsMap[import.meta.env.IMPLEMENTATION ?? 'piniaLocalStorage']

export async function baseSetup (ctx) {
  const piniaOrm = createORM()
  const piniaFront = createPinia()
  piniaFront.use(piniaOrm)

  const app = createApp({})

  await setups.baseSetup(app, {
    piniaFront,
  }, ctx)

  const vueModel = createVueModel({
    default: 'testDriver',
    drivers: {
      testDriver: {
        implementation: setups.implementation,
        config: { pinia: piniaFront },
      },
    },
  })

  app.use(piniaFront)
  app.use(vueModel)
  app.use(piniaOrm)

  const frontRepoUser = useRepo(User, piniaFront)
  const frontRepoComment = useRepo(Comment, piniaFront)
  const frontRepoPhoto = useRepo(Photo, piniaFront)
  const frontRepoPost = useRepo(Post, piniaFront)
  const frontRepoAlbum = useRepo(Album, piniaFront)

  frontRepoUser.flush()
  frontRepoComment.flush()
  frontRepoPhoto.flush()
  frontRepoPost.flush()
  frontRepoAlbum.flush()

  vueModelState.config.pagination = {}
  vueModelState.drivers.testDriver.config.pagination = {}
  vueModelState.drivers.testDriver.config.scopes = {}
  vueModelState.config.globallyAppliedScopes = undefined
  vueModelState.config.globallyAppliedEntityScopes = undefined
  vueModelState.drivers.testDriver.config.globallyAppliedScopes = undefined
  vueModelState.drivers.testDriver.config.globallyAppliedEntityScopes = undefined
  vueModelState.config.scopes = undefined
  vueModelState.config.entityScopes = undefined
}
