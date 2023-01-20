<template>
  <v-card>
    <tag-create-form :given-tags="allTags" @newTag="addNewTag" />
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
import { initId } from '../../store'
import TagList from './TagList.vue'
import TagCreateForm from './TagCreateForm.vue'

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
  components: { TagList, TagCreateForm },
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
      noLoginError: Error('ログインしていません。'),
      selectedTags: [] as Array<TagToApi>,
      notSelectedTags: [] as Array<TagToApi>,
      allTags: [] as Array<TagToApi>,
      createdBy: initId,
    }
  },
  watch: {
    givenSelectedTags(val: Array<TagToApi>) {
      this.selectedTags = [...val]
    },
    givenNotSelectedTags(val: Array<TagToApi>) {
      this.notSelectedTags = [...val]
    },
  },
  mounted() {
    this.selectedTags = [...(this.givenSelectedTags as Array<TagToApi>)]
    this.notSelectedTags = [...(this.givenNotSelectedTags as Array<TagToApi>)]
    this.allTags = Array.from(
      new Set([...this.selectedTags, ...this.notSelectedTags])
    )
  },

  methods: {
    /**
     * tag-create-form で作成したタグを追加する。
     */
    addNewTag(tagName: string) {
      try {
        this.createdBy = this.getUserId() as string
      } catch {}
      const newTag: TagToApi = {
        id: null,
        name: tagName,
        created_by: this.createdBy,
      }
      this.addTag(newTag)
    },
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
     * todo: tagのidがnull の時は、selectedTag から削除するだけにする
     */
    deleteTag(tag: TagToApi) {
      this.selectedTags = this.selectedTags.filter((item) => item.id !== tag.id)
      if (tag.id !== null) {
        this.notSelectedTags.push(tag)
      }
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
    /**
     * ユーザーidを取得する。ログインしていなかったらエラーを返す
     */
    getUserId(): string | Error {
      if (
        this.$accessor.logedIn === true ||
        this.$accessor.logedInTrial === true
      ) {
        return this.$accessor.id
      } else {
        throw this.noLoginError
      }
    },
  },
})
</script>