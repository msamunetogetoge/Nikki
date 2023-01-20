<template>
  <v-card>
    <v-card-title>タグ作成</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="tagName"
        :append-icon="'mdi-tag-plus'"
        @click:append="saveTag"
      >
      </v-text-field>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { isExistTag, TagToApi } from '../../script/tag'
/**
 * タグを選択するダイアログ。
 * 選択済みのタグリストと、未選択タグのリストを表示する。
 * 選択済みタグをクリックすると、選択済みタグリストから削除して、未選択タグリストに追加する。その逆も行う。
 * 保存ボタンを押すと、親に選択済みタグリストをArray<TagToApi>に詰めて渡す。
 * evrnt:
 * saveTags... 保存ボタンを押すと呼ばれる。親に選択済みタグリストをArray<TagToApi>に詰めて渡す。
 * close... 閉じるボタンを押すと呼ばれる。親にダイアログを非表示にしてくれと信号を送る。
 */
export default defineComponent({
  components: {},
  props: {
    givenTags: {
      type: Array,
      default: () => {
        return [] as Array<TagToApi>
      },
    },
  },
  data() {
    return {
      allTags: [] as Array<TagToApi>,
      tagName: '',
    }
  },
  watch: {
    givenTags(val: Array<TagToApi>) {
      this.allTags = val
    },
  },
  mounted() {
    this.allTags = this.givenTags as Array<TagToApi>
  },

  methods: {
    saveTag() {
      if (this.tagName.trim() === '') {
        alert('タグ名を入力してください。')
      } else if (isExistTag(this.allTags, this.tagName)) {
        alert('既に存在するタグです。')
      } else {
        this.$emit('newTag', this.tagName)
        this.tagName = ''
      }
    },

    /**
     * このダイアログを閉じる
     */
    closeDialog(): void {
      this.$emit('close')
    },
  },
})
</script>