<script lang="ts" setup>
import { useBatchUpdater, useIndexer } from '@vuemodel/core'
import { populateRecords, User } from '@vuemodel/sample-data'
import { clear } from 'idb-keyval'

const usersIndexer = useIndexer(User)
async function setUsers () {
  await clear()
  await populateRecords('users')
  usersIndexer.index()
}
setUsers()

const usersBatchUpdater = useBatchUpdater(User)
</script>

<template>
  <div style="display: flex; flex-direction: column; max-width: 350px">
    <!--  -->
  </div>
</template>
