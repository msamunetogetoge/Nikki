<template>
  <v-app dark>
    <v-main>
      <v-container fill-height>
        <Nuxt />
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SimpleLayout',
  data() {
    return {
      fixed: false,
    }
  },
})
</script>

