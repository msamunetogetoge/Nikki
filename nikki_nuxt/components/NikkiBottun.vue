<template>
  <v-btn
    class="mx-2"
    large
    bottom
    right
    fab
    fixed
    dark
    color="light-blue"
    @click="$emit('click')"
  >
    <v-icon dark> mdi-notebook-plus </v-icon>
  </v-btn>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {},
})
</script>
