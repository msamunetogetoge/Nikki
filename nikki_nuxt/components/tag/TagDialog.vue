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
        :given-tags="choicedTag"
        @close="tagChoice = false"
        @saveTags="tagAdded"
      />
    </v-dialog>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import { TagFromApi, TagToApi } from '../../script/tag'

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
      choicedTag: [] as Array<TagFromApi>,
    }
  },
  mounted() {
    this.choicedTag = this.givenTag as Array<TagFromApi>
  },
  methods: {
    tagAdded(tags: Array<TagFromApi>) {
      this.choicedTag = tags
      this.$emit('tagAdded', this.choicedTag)
    },
  },
})
</script>
