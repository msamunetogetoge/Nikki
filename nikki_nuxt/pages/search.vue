<template>
  <v-card class="overflow-hidden">
    <v-row>
      <!-- TextSearch.vue を配置 $emit でエンターキー押下を検知する, $emit で検索条件追加ボタン押下を検知してDetailSearch.vue を開く -->
      <text-search
        @showDetail="detail = !detail"
        @search="searchNikki"
        @updateText="updateText"
    /></v-row>
    <v-row v-if="detail"
      ><!-- DetailSearch.vue を配置 $emit で検索ボタン押下を検知する -->
      <detail-search />
    </v-row>
    <v-row>
      <searched-nikki-list
        :search-complete="searchCompolete"
        :seached-nikki-list="nikkiList"
      />
    </v-row>
  </v-card>
</template>



<script lang="ts">
import Vue from 'vue'
import SearchedNikkiList from '../components/search/SearchedNikkiList.vue'
import TextSearch from '../components/search/TextSearch.vue'
import DetailSearch from '../components/search/DetailSearch.vue'
import { NikkiFromApi } from '../script/nikki'
import { SearchParams } from '../script/search'

export default Vue.extend({
  // rodo: エラー出てるので直す
  name: 'SearchComponent',
  components: { SearchedNikkiList, TextSearch, DetailSearch },

  data() {
    return {
      nikkiList: [] as Array<NikkiFromApi>,
      searchComplete: false,
      detail: false,
      searchParams: new SearchParams(),
    }
  },
  mounted() {},
  methods: {
    updateText(text: string) {
      this.searchParams.title_or_contents = text
    },
    async search(
      searchParamsFromChild: SearchParams | undefined
    ): Promise<Array<NikkiFromApi>> {
      if (searchParamsFromChild !== undefined) {
        alert('not undefined')
      }
      alert('検索！')

      return await []
      // this.searchParams を使って検索する
    },
    async excecuteSearch(searchParamsFromChild: SearchParams | undefined) {
      // this.search() -> this.nikkiList
      const nikkiList = await this.search(searchParamsFromChild)
      console.log(nikkiList)
      this.nikkiList = nikkiList
    },
  },
})
</script>
