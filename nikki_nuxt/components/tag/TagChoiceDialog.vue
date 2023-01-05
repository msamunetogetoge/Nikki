<template>
  <v-card>
    <tag-list
      :tags="allTags"
      :selected-tags="givenTags"
      @changeTag="changeSelectedTags"
    />
    <v-card-actions>
      <v-btn text color="deep-purple accent-4" @click="tagNikki"> 保存 </v-btn>
      <v-btn text @click="closeDialog">閉じる</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagFromApi, getAllTags } from '../../script/tag'
import { initId } from '../../store'
import TagList from './TagList.vue'

export default defineComponent({
  components: { TagList },
  props: {
    givenTags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
  },
  data() {
    return {
      allTags: [] as Array<TagFromApi>,
      createdBy: initId,
      selectedTags: [] as Array<TagFromApi>,
      noLoginError: Error('ログインしていません。'),
    }
  },
  async mounted() {
    this.createdBy = this.getUserId() as string
    this.selectedTags = this.givenTags as Array<TagFromApi>
    try {
      this.allTags = (await getAllTags(this.createdBy)) as Array<TagFromApi>
    } catch (error) {
      alert(error)
    }
  },
  methods: {
    // todo: changeSelectedTagsが動いてない
    changeSelectedTags(selectedTags: Array<TagFromApi>): void {
      this.selectedTags = selectedTags
    },
    tagNikki(): void {
      this.$emit('saveTags', this.selectedTags)
      this.closeDialog()
    },
    closeDialog(): void {
      this.$emit('close')
    },
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