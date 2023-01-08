<template>
  <v-card>
    <tag-list :tag-list="selectedTags" :is-editable="true" @pop="deleteTag" />
    <v-divider class="mx-4"></v-divider>
    <tag-list
      :tag-list="notSelectedTags"
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
import { TagFromApi, TagToApi, tagToApi2FromApi } from '../../script/tag'
import TagList from './TagList.vue'

export default defineComponent({
  components: { TagList },
  props: {
    givenSelectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
    givenNotSelectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
  },
  data() {
    return {
      selectedTags: [] as Array<TagFromApi>,
      notSelectedTags: [] as Array<TagFromApi>,
    }
  },
  mounted() {
    this.selectedTags = this.givenSelectedTags
    this.notSelectedTags = this.givenSelectedTags
  },
  methods: {
    /**
     * 未選択タグを、選択タグに移動する
     */
    addTag(tag: TagToApi) {
      const tagFromApi = tagToApi2FromApi(tag)
      this.selectedTags.push(tagFromApi)
      this.notSelectedTags = this.tagList = this.tagList.filter(
        (item) => item !== tagFromApi
      )
    },
    /**
     * 選択多済みタグを、未選択タグに移動する
     */
    deleteTag(tag: TagToApi) {
      const tagFromApi = tagToApi2FromApi(tag)
      this.notSelectedTags.push(tagFromApi)
      this.selectedTags = this.tagList = this.tagList.filter(
        (item) => item !== tagFromApi
      )
    },
    // todo: changeSelectedTagsが動いてない
    changeSelectedTags(selectedTags: Array<TagFromApi>): void {
      this.selectedTags = selectedTags
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