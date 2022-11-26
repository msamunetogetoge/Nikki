<template>
  <div>
    <v-text-field
      v-model="text"
      label="タイトルや内容から検索します。"
      append-icon="mdi-magnify-plus"
      @click:append="showDetail"
      @keypress.enter="search"
    >
      <!-- mdi-magnify-plus を表示、クリックしたらshowDetail, enterkey を押したらsearch -->
    </v-text-field>
  </div>
</template>



<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TextSearchComponent',

  data() {
    return {
      text: '',
    }
  },
  watch: {
    text(val) {
      // 親に更新されたtextを渡す
      this.$emit('updateText', val)
    },
  },
  mounted() {},
  methods: {
    // Nikki検索のフラグを送る
    search() {
      this.$emit('search')
    },
    // 詳細画面を開くフラグを送る
    showDetail() {
      this.$emit('showDetail')
    },
  },
})
</script>