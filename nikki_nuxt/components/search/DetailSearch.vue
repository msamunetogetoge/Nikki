<template>
  <v-card>
    <v-card-title> 詳細検索 </v-card-title>
    <v-form>
      <v-row>
        <v-col> から </v-col>
        <v-col> まで </v-col>
      </v-row>
      <v-row>
        <v-col> 最低 </v-col>
        <v-col> 最高 </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>



<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DetailSearchComponent',

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