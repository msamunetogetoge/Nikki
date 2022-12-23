<template>
  <v-card class="mx-auto" max-width="300" tile>
    <v-list dense>
      <v-subheader>タグ</v-subheader>
      <v-list-item v-for="(tag, i) in tags" :key="i">
        <v-list-item-content>
          <tag-component
            :name-given="tag.name"
            :tag-id="tag.id"
            :created-by="tag.created_by"
            :added="tag in selectedTags"
            @giveTag="clickedTag"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagFromApi, TagToApi } from '../../script/tag'
import TagComponent from '../tag/TagComponent.vue'

export default defineComponent({
  components: {
    TagComponent,
  },
  props: {
    tags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
    selectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
  },
  data() {
    return {
      name: '',
    }
  },
  mounted() {},
  methods: {
    /**
     * tag 情報を親に渡す関数。
     * tag-component からTagToApi がわたってくる
     */
    clickedTag(tag: TagToApi) {
      this.$emit('addTag', tag)
    },
  },
})
</script>
