<template>
  <v-card class="overflow-hidden">
    <v-row> </v-row>
    <v-row> </v-row>
    <v-row> 
        <searched-nikki-list :search-complete="searchCompolete" :seached-nikki-list="nikkiList">
    </v-row>
  </v-card>
</template>



<script lang="ts">
import Vue from 'vue'
import SearchedNikkiList from '../components/search/SearchedNikkiList.vue'
import { NikkiFromApi } from '../script/nikki'

export default Vue.extend({
  name: 'SearchComponent',
  components: { SearchedNikkiList },

  data() {
    return {
      nikkiList: [] as Array<NikkiFromApi>,
      searchComplete: false,
    }
  },
  async mounted() {},
  methods: {},
})
</script>
