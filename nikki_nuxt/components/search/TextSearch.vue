<template>
  <v-text-field
    v-model="text"
    solo
    label="タイトルや内容から検索します。"
    append-icon="mdi-magnify-plus"
    @click:append="showDetail"
    @keypress.enter="search"
  >
  </v-text-field>
</template>



<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
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