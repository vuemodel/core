import { boot } from 'quasar/wrappers'
import { createVueModel, useModelDriver } from '@vuemodel/core'
import { createIndexedDb, indexedDbVueModelDriver } from '@vuemodel/indexeddb'

export default boot(({ app, store }) => {
  const indexedDb = createIndexedDb({
    frontStore: store,

    /**
     * We use localStorage to create a `mockLatency`. By changing this value
     * in localStorage, we can easily test loading state in our app
     */
    mockLatencyMs: Number(localStorage.getItem('mockLatencyMs') ?? 150),
  })

  const vueModel = createVueModel({
    default: 'local',
    drivers: {
      local: {
        driver: {
          ...indexedDbVueModelDriver,

          /**
           * useModel is a convenience composables that covers all CRUD operations
           * in one. It's currently experimental, and only included by default
           * when using indexed db for faster prototyping!
           */
          useModel: useModelDriver,
        },
        config: {
          pinia: store,

          scopes: {
            /**
             * The order of records can be unpredictable when working with indexeddb.
             * We add a `latest` scope to help make the UI more predictable
             * when the user refreshes the page.
             */
            latest: {
              orderBy: [
                { field: 'created_at', direction: 'descending' },
              ],
            },

            /**
             * This scope checks if the resource has a `owner_id` field. If it
             * does, we filter the request to the authenticated user
             */
            scopeToUser (context) {
              const authId = localStorage.getItem('authenticatedUserId')
              const ModelClass = context?.ModelClass
              const hasOwnerIdField = ModelClass ? !!(new ModelClass()).$fields().owner_id : false

              if (hasOwnerIdField) {
                return {
                  filters: {
                    owner_id: { equals: authId ?? '' },
                  },
                }
              }

              return {
              }
            },
          },
          globallyAppliedScopes: ['scopeToUser'],

          /**
           * Often APIs automatically set an `updated_at` and `created_at` field.
           * By adding the hooks below, we get similar functionality.
           * Particularly useful when ordering records.
           */
          hooks: {
            creating: [
              ({ form }) => {
                const now = new Date()
                form.created_at = now.getTime()
                form.updated_at = now.getTime()
              },
              ({ ModelClass, form }) => {
                const authId = localStorage.getItem('authenticatedUserId')
                const hasUserIdField = ModelClass ? !!(new ModelClass()).$fields().owner_id : false

                if (hasUserIdField && authId) {
                  form.owner_id = authId
                }
              },
            ],

            updating: [
              ({ form }) => {
                const now = (new Date())
                form.updated_at = now.getTime()
              },
            ],

            bulkUpdating: [
              ({ forms }) => {
                const now = new Date()
                Object.values(forms).forEach((form) => {
                  form.updated_at = now.getTime()
                })
              },
            ],
          },
        },
      },
    },
  })

  app.use(vueModel)
  app.use(indexedDb)
})
