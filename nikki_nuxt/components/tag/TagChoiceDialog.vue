<template>
  <tag-list :tags="allTags" :selected-tags="givenTags" />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagFromApi, getAllTags } from '../../script/tag'
import { initId } from '../../store'
import TagList from './TagList.vue'

export default defineComponent({
  components: { TagList },
  prop: {
    givenTags: {
      type: Array,
      default() {
        return [] as Array<TagFromApi>
      },
    },
  },
  data() {
    return {
      allTags: [] as Array<TagFromApi>,
      createdBy: initId,
      noLoginError: Error('ログインしていません。'),
    }
  },
  async mounted() {
    this.createdBy = this.getUserId() as string
    try {
      this.allTags = (await getAllTags(this.createdBy)) as Array<TagFromApi>
    } catch (error) {
      alert(error)
    }
  },
  methods: {
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