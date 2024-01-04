import { ImplementationSetups } from './implementationSetupsMap'
import { createOrion, orionVueModelDriver } from '@vuemodel/orion'
import wretch from 'wretch'

export const orionSetups: ImplementationSetups = {
  populateRecords: async (entityName, numberOfRecords) => {
    await fetch(`http://localhost/api/seed/${entityName}/${numberOfRecords}`)
  },

  implementation: orionVueModelDriver,

  async setMockLatency () {

  },

  async setMockValidationErrors () {

  },

  async setMockStandardErrors () {

  },

  async baseSetup (app, context, testContext) {
    if ([
      'can respond with validation errors',
      'can create a resource with a composite key',
      'can update a resource with a composite key',
      'can pass an array to "update" to update via composite key',
      'can destroy a resource with a composite key',
      'can pass an array to "destroy" to destroy via composite key',
      'rolls back if the destroy fails when using optimistic', // hard to cause an error
      'sets validation errors when the response has validation errors',
      'clears validation errors when a request is made',
      'can find a resource with a composite key',
      'can pass an array to "find" to find via composite key',
      'cancels the first request if a second request is made and the first is not done yet',
      'sets standard errors when the response has standard errors',
      'clears standard errors when a request is made',
      'can index records that have a composite key',
      'can index records that have a composite key using "index(ids)"',
      'can index records that have a composite key using "indexer.options.whereIdIn"',
      'can access records from "indexer.records.value" when indexing with composite keys',
      'can populate a related record where the related record has a composite key',
      'can notify on error',
      'can respond with standard errors',
      'has a first preference for notifyOnError passed as a param',
      'has a second preference for notifyOnError set at a "state.driver.xxx.config" level',
      'has a third preference for notifyOnError set at a "state.config" level',
      'has first precedence for options.throw',
      'has second precedence for options.driver.throw',
      'has third precedence for options.throw',
      'can abort an index request (not immediately)',
    ].includes(testContext.task.name)) {
      testContext.skip()
      return
    }

    await fetch('http://localhost/api/artisan/db:wipe')
    await fetch('http://localhost/api/artisan/migrate')

    const orion = createOrion({
      name: 'testDriver',
      store: context.piniaFront,
      createWretch: () => {
        return wretch('http://localhost/api')
      },
    })

    app.use(orion)
  },
}
