import { boot } from 'quasar/wrappers'
import { createVueModel } from '@vuemodel/core'
import { createOrion, orionVueModelDriver } from '@vuemodel/orion'
import wretch from 'wretch'

export default boot(({ app, store }) => {
  const orion = createOrion({
    name: 'api',
    createWretch: () => {
      const token = localStorage.getItem('auth-token')

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      // 🤿
      return wretch()
        /**
         * Here we set the endpoint prefix for your orion api routes. If your
         * app and endpoint share the same domain, you might not need an
         * environment variable and '/api' would be enough.
         */
        .url(process.env.API_URL + '/api')
        .headers(headers)
    },
  })

  const vueModel = createVueModel({
    default: 'api',
    drivers: {
      api: {
        driver: orionVueModelDriver,
        config: {
          pinia: store,
          /**
           * If you're using UIDs, comment out the function below and install a UID library
           * of your choice. If using UUIDs, consider using `crypto.randomUUID()`.
           * The `crypto` library is built into the browser.
           */
          // makeId: () => uid(),
        },
      },
    },
  })

  app.use(vueModel)
  app.use(orion)
})
