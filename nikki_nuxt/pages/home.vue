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
import Vue from 'vue'
import NikkiList from '../components/NikkiList.vue'

export default Vue.extend({
  components: { NikkiList },
  name: 'HomeComponent',
  data() {
    return {}
  },
  async mounted() {},
  methods: {},
})
</script>
