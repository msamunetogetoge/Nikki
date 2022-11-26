<template>
  <v-card class="overflow-hidden">
    <v-row> </v-row>
    <v-row> </v-row>
    <v-row> </v-row>
  </v-card>
</template>



<script lang="ts">
import Vue from 'vue'
import SearchedNikkiList from '../components/search/SearchedNikkiList.vue'

export default Vue.extend({
  name: 'SearchComponent',
  components: { SearchedNikkiList },

  data() {
    return {}
  },
  async mounted() {},
  methods: {},
})
</script>
