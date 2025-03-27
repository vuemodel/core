<script lang="ts" setup>
import { useFinder, vueModelState } from '@vuemodel/core'
import { User, populateRecords } from '@vuemodel/sample-data'

vueModelState.config.scopes = {
  tenantIdNotOne: () => {
    return {
      filters: {
        tenant_id: {
          doesNotEqual: 1,
        },
      },
    }
  },
}

vueModelState.config.globallyAppliedScopes = ['tenantIdNotOne']

populateRecords('users')
populateRecords('posts')

const finder = useFinder(User, {
  with: {
    posts: {},
  },
  withoutGlobalScopes: ['tenantIdNotOne'],
  id: 1,
})
</script>

<template>
  <div>
    <button @click="finder.find()">
      Find Users
    </button>

    <pre>{{ finder.record.value }}</pre>
  </div>
</template>
