<template>
  <v-card class="overflow-hidden">
    <v-row> <!-- TextSearch.vue を配置 $emit でエンターキー押下を検知する, $emit で検索条件追加ボタン押下を検知してDetailSearch.vue を開く --></v-row>
    <v-row v-if="detail"><!-- DetailSearch.vue を配置 $emit で検索ボタン押下を検知する --> </v-row>
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
      detail: false,
    }
  },
  async mounted() {},
  methods: {},
})
</script>
