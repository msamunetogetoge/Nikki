<template>
  <v-dialog v-model="flag" fullscreen>
    <v-container fluid fill-height class="loading_bg">
      <v-layout justify-center align-center>
        <v-progress-circular :indeterminate="true" color="accent" />
      </v-layout>
    </v-container>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    nowLoading: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  },
  data() {
    return {
      flag: false,
    }
  },
  watch: {
    nowLoading(val) {
      this.flag = val
    },
  },
})
</script>
