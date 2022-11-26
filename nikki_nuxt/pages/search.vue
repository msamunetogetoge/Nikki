<template>
  <v-card>
    <!-- TextSearch.vue を配置 $emit でエンターキー押下を検知する, $emit で検索条件追加ボタン押下を検知してDetailSearch.vue を開く -->
    <text-search
      @showDetail="detail = !detail"
      @search="excecuteSearch"
      @updateText="updateText"
    />

    <!-- DetailSearch.vue を配置 $emit で検索ボタン押下を検知する -->
    <!-- v-datepickerをコンポーネント化して使用する -->
    <detail-search v-if="detail" @search="excecuteSearch" />

    <searched-nikki-list
      v-if="searchComplete"
      :seached-nikki-list="nikkiList"
    />
  </v-card>
</template>



<script lang="ts">
import { defineComponent } from 'vue'
import SearchedNikkiList from '../components/search/SearchedNikkiList.vue'
import TextSearch from '../components/search/TextSearch.vue'
import DetailSearch from '../components/search/DetailSearch.vue'
import { NikkiFromApi } from '../script/nikki'
import { SearchParams, getNikkiByParams } from '../script/search'

export default defineComponent({
  // rodo: エラー出てるので直す
  name: 'SearchComponent',
  components: { SearchedNikkiList, TextSearch, DetailSearch },
  layout: 'search',

  data() {
    return {
      nikkiList: [] as Array<NikkiFromApi>,
      searchComplete: false,
      detail: false,
      searchParams: new SearchParams(),
      noLoginError: Error('ログインしていません。'),
    }
  },
  // ログインしていたら、searchParams にidをセットする
  mounted() {
    if (
      this.$accessor.logedIn === true ||
      this.$accessor.logedInTrial === true
    ) {
      this.searchParams.created_by = this.$accessor.id
    } else {
      throw this.noLoginError
    }
  },
  methods: {
    updateText(text: string) {
      this.searchParams.title_or_contents = text
    },
    async search(
      searchParamsFromChild: SearchParams | undefined
    ): Promise<Array<NikkiFromApi>> {
      if (searchParamsFromChild !== undefined) {
        this.searchParams.to_date = searchParamsFromChild.to_date
        this.searchParams.from_date = searchParamsFromChild.from_date
        this.searchParams.goodness_min = searchParamsFromChild.goodness_min
        this.searchParams.goodness_max = searchParamsFromChild.goodness_max
        console.log(searchParamsFromChild)
      }
      const nikkiList = getNikkiByParams(this.searchParams)
      return await nikkiList
    },
    async excecuteSearch(searchParamsFromChild: SearchParams | undefined) {
      // this.search() -> this.nikkiList
      const nikkiList = await this.search(searchParamsFromChild)
      this.nikkiList = nikkiList
      this.searchComplete = true
    },
  },
})
</script>
