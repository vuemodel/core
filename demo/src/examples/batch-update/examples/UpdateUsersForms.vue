<script lang="ts" setup>
import type { Forms } from '@vuemodel/core'
import type { User } from '@vuemodel/sample-data'

const forms = defineModel<Forms<User>>('modelValue', { required: true })
</script>

<template>
  <div style="display: flex; flex-direction: row; max-width: 900px; flex-wrap: wrap;">
    <div
      v-for="formEntry in Object.entries(forms)"
      :key="formEntry[0]"
      :style="`
          border: 2px solid black;
          padding: 8px;
          max-width: 400px;
        `"
    >
      <label>
        Name
        <input
          v-model="formEntry[1].name"
          placeholder="Name"
        >
      </label>
      <label>
        Email
        <input
          v-model="formEntry[1].email"
          placeholder="Email"
        >
      </label>
    </div>
  </div>
</template>
