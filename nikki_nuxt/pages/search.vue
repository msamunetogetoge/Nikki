<template>
  <v-card>
    <!-- エンターキー押下を検知し検索する。 検索条件追加ボタン押下を検知してDetailSearch.vue を開く -->
    <text-search
      @showDetail="detail = !detail"
      @search="excecuteSearch"
      @updateText="updateText"
    />

    <!-- 検索ボタン押下を検知し検索する -->
    <!-- searchParamsにセットする値が更新されたら検知して更新する -->
    <detail-search
      v-if="detail"
      @search="excecuteSearch"
      @updateToDate="setToDate"
      @updateFromDate="setFromDate"
      @updateGoodnessMin="setGoodnessMin"
      @updateGoodnessMax="setGoodnessMax"
    />
    <!-- 検索が完了したらv-ifにtrueを渡す。 -->
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
    // <text-search />のテキストフィールドの値の更新を検知して、searchParamsにセットする
    updateText(text: string) {
      this.searchParams.title_or_contents = text
    },

    // <detail-search /> の値の更新を検知して、searchParamsにセットする。start
    setToDate(toDate: string) {
      this.searchParams.to_date = toDate
    },
    setFromDate(fromDate: string) {
      this.searchParams.from_date = fromDate
    },
    setGoodnessMin(goodnessMin: number) {
      this.searchParams.goodness_min = goodnessMin
    },
    setGoodnessMax(goodnessMax: number) {
      this.searchParams.goodness_max = goodnessMax
    },
    // <detail-search /> の値の更新を検知して、searchParamsにセットする。end

    // 検索を実行してthis.nikkiListに与える値を取得する。
    async search(
      searchParamsFromChild: SearchParams | undefined
    ): Promise<Array<NikkiFromApi>> {
      if (searchParamsFromChild !== undefined) {
        this.searchParams.to_date = searchParamsFromChild.to_date
        this.searchParams.from_date = searchParamsFromChild.from_date
        this.searchParams.goodness_min = searchParamsFromChild.goodness_min
        this.searchParams.goodness_max = searchParamsFromChild.goodness_max
      }
      const nikkiList = getNikkiByParams(this.searchParams)
      return await nikkiList
    },
    // 検索を実行してthis.nikkiListに与える。
    async excecuteSearch(searchParamsFromChild: SearchParams | undefined) {
      const nikkiList = await this.search(searchParamsFromChild)
      this.nikkiList = nikkiList
      this.searchComplete = true
    },
  },
})
</script>
