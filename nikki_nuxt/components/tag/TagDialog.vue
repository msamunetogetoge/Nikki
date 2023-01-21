<template>
  <v-card class="mx-auto" max-width="344">
    <v-card-text>
      <h4 v-if="selectedTag.length == 0">選択タグ無し</h4>
      <tag-list v-else :given-tag-list="selectedTag" />
    </v-card-text>

    <v-card-actions>
      <v-btn text color="deep-purple accent-4" @click="tagChoice = true">
        タグ追加
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="tagChoice" max-width="600">
      <tag-choice-dialog
        :given-selected-tags="selectedTag"
        :given-not-selected-tags="notSelectedTag"
        @close="tagChoice = false"
        @saveTags="tagAdded"
      />
    </v-dialog>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { TagFromApi, TagToApi, getAllTags } from '../../script/tag'
import { initId } from '../../store'

import TagChoiceDialog from './TagChoiceDialog.vue'
import TagList from './TagList.vue'
/**
 * タグ付けされたタグを表示する。
 * タグ選択ダイアログを表示する。
 * event:
 * tagAdded... tag-choice-dialogで保存ボタンが押されたときに呼ばれる。親に選択されたタグの情報を伝える。
 */
export default defineComponent({
  components: { TagChoiceDialog, TagList },
  props: {
    givenTag: {
      type: Array,
      default: () => {
        return [] as Array<TagToApi>
      },
    },
  },

  data() {
    return {
      tagChoice: false, // TagChoiceDialog出現のフラグ
      selectedTag: [] as Array<TagToApi>, // タグ付け済みのタグ
      notSelectedTag: [] as Array<TagToApi>, // タグ付けされていないタグ
      noLoginError: Error('ログインしていません。'),
      createdBy: initId, // tag.created_by で使用する変数
      allTag: [] as Array<TagFromApi>, // ダイアログが作られたときに、一度だけ作成する。 todo: もしかしたらnikkiList を作成した時にasyncで作成し、dialogを呼ぶときにawaitした方が良いかもしれない。
    }
  },
  watch: {
    /**
     * タグ付けされたタグのリストが更新されたら表示を変更する
     */
    givenTag(val: Array<TagToApi>) {
      this.selectedTag = val
      this.notSelectedTag = this.getNotSelectedTag()
    },
  },
  /**
   * タグの表示を整える為に変数を更新する
   */
  async mounted() {
    try {
      this.createdBy = this.getUserId() as string
    } catch {}
    this.allTag = (await getAllTags(this.createdBy)) as Array<TagFromApi>
    this.selectedTag = this.givenTag as Array<TagToApi>
    this.notSelectedTag = this.getNotSelectedTag()
  },
  methods: {
    /**
     * タグ付けされていないタグの取得
     */
    getNotSelectedTag(): Array<TagToApi> {
      const allTags = this.allTag as Array<TagToApi>
      const notSelectedTag = this.getArrayDiff(this.selectedTag, allTags)
      return notSelectedTag
    },
    /**
     * 保存ボタンが押されたときに呼ばれる関数
     * emit 'tagAdded'
     */
    tagAdded(tags: Array<TagToApi>) {
      this.selectedTag = tags
      this.$emit('tagAdded', this.selectedTag)
    },
    /**
     * array1 とarray2 の非共通部分の配列を返す
     *  A∨B - A⋀B を返す
     * 注意: array.id = null の時多分おかしい事がおこる。 実際には mount時にTagFromApiで渡ってくるデータしか扱わないので、そのような場合は起こらないが。
     */
    getArrayDiff(
      array1: Array<TagToApi>,
      array2: Array<TagToApi>
    ): Array<TagToApi> {
      const allArray = Array.from(new Set([...array1, ...array2]))
      const array1Id = array1.map((item) => item.id!)
      const array2Id = array2.map((item) => item.id!)
      return allArray.filter(
        (item) =>
          !array1Id.includes((item as TagToApi).id!) ||
          !array2Id.includes((item as TagToApi).id!)
      )
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
