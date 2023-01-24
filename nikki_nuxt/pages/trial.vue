<template>
  <v-card class="overflow-hidden">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="12">
        <nikki-list />
      </v-col>
    </v-row>
  </v-card>
</template>



<script lang="ts">
import { defineComponent } from 'vue'
import NikkiList from '../components/NikkiList.vue'

export default defineComponent({
  name: 'HomeComponent',
  components: { NikkiList },
  layout: 'trial',

  data() {
    return {}
  },
  mounted() {},
  methods: {},
})
</script>