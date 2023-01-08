<template>
  <v-card class="mx-auto" max-width="344">
    <v-card-text>
      <tag-list :tags="choicedTag" />
    </v-card-text>
    <v-card-actions>
      <v-btn text color="deep-purple accent-4" @click="tagChoice = true">
        タグ追加
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="tagChoice">
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
// todo: tag-choice-dialogにgivenSelectedTags,givenNotSelectedTagsをあげる
// givenSelectedTags はもらったものをそのまま。
// givenNotSelectedTagsはmoubnted でallTagsを取得し、編集して渡す。(async await で未選択タグ部分でawaitする)
//

import { defineComponent } from 'vue'

import { TagFromApi, TagToApi, getAllTags } from '../../script/tag'
import { initId } from '../../store'

import TagChoiceDialog from './TagChoiceDialog.vue'
import TagList from './TagList.vue'

export default defineComponent({
  components: { TagChoiceDialog, TagList },
  props: {
    givenTag: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
  },

  data() {
    return {
      tagChoice: false,
      selectedTag: [] as Array<TagFromApi>,
      notSelectedTag: [] as Array<TagFromApi>,
      noLoginError: Error('ログインしていません。'),
      createdBy: initId,
    }
  },
  async mounted() {
    this.selectedTag = this.givenTag as Array<TagFromApi>
    this.notSelectedTag = await this.getNotSelectedTag()
  },
  methods: {
    async getNotSelectedTag(): Promise<Array<TagFromApi>> {
      try {
        this.createdBy = this.getUserId() as string
      } catch {}
      const allTags = (await getAllTags(this.createdBy)) as Array<TagFromApi>
      const notSelectedTag = this.getArrayDiff(this.selectedTag, allTags)
      return notSelectedTag
    },

    tagAdded(tags: Array<TagFromApi>) {
      this.selectedTag = tags
      this.$emit('tagAdded', this.selectedTag)
    },
    /**
     * array1 とarray2 の非共通部分の配列を返す
     */
    getArrayDiff<T>(array1: Array<T>, array2: Array<T>): Array<T> {
      const allArray = [...array1, ...array2]
      return allArray.filter(
        (item) => !array1.includes(item) || !array2.includes(item)
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
