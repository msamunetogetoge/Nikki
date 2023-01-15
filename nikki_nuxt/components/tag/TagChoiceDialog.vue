<template>
  <v-card>
    <v-card-title>選択済</v-card-title>
    <tag-list
      :given-tag-list="selectedTags"
      :is-editable="true"
      @pop="deleteTag"
    />
    <v-divider class="mx-4"></v-divider>
    <v-card-title>未選択</v-card-title>
    <tag-list
      :given-tag-list="notSelectedTags"
      :is-editable="true"
      @pop="addTag"
    />
    <v-card-actions>
      <v-btn text color="deep-purple accent-4" @click="tagNikki"> 保存 </v-btn>
      <v-btn text @click="closeDialog">閉じる</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagToApi } from '../../script/tag'
import TagList from './TagList.vue'
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
  components: { TagList },
  props: {
    givenSelectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagToApi>
      },
    },
    givenNotSelectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagToApi>
      },
    },
  },
  data() {
    return {
      selectedTags: [] as Array<TagToApi>,
      notSelectedTags: [] as Array<TagToApi>,
    }
  },
  watch: {
    givenSelectedTags(val: Array<TagToApi>) {
      this.selectedTags = val
    },
    givenNotSelectedTags(val: Array<TagToApi>) {
      this.notSelectedTags = val
    },
  },
  mounted() {
    this.selectedTags = this.givenSelectedTags as Array<TagToApi>
    this.notSelectedTags = this.givenNotSelectedTags as Array<TagToApi>
  },

  methods: {
    /**
     * 未選択タグを、選択タグに移動する
     */
    addTag(tag: TagToApi) {
      this.selectedTags.push(tag)
      this.notSelectedTags = this.notSelectedTags.filter(
        (item) => item.id !== tag.id
      )
    },
    /**
     * 選択多済みタグを、未選択タグに移動する
     */
    deleteTag(tag: TagToApi) {
      this.notSelectedTags.push(tag)
      this.selectedTags = this.selectedTags.filter((item) => item.id !== tag.id)
      console.log('in  delete tag')
      console.log(tag)
      console.log(this.selectedTags)
    },
    /**
     * tagをNikkiに設定する
     */
    tagNikki(): void {
      this.$emit('saveTags', this.selectedTags)
      this.closeDialog()
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