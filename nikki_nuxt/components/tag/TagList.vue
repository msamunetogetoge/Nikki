<template>
  <v-card class="mx-auto" max-width="300" tile>
    <v-list dense>
      <v-list-item v-for="(tag, i) in tagList" :key="i">
        <v-list-item-content>
          <tag-component
            :name-given="tag.name"
            :tag-id="tag.id"
            :created-by="tag.created_by"
            :added="selectedTags.includes(tag)"
            @clickTag="popTag"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagFromApi, tagfromApi2ToApi, TagToApi } from '../../script/tag'
import TagComponent from '../tag/TagComponent.vue'

export default defineComponent({
  components: {
    TagComponent,
  },
  props: {
    givenTagList: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
    isEditable: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  },
  data() {
    return {
      tagList: [] as Array<TagToApi>,
    }
  },
  mounted() {
    for (let index = 0; index < this.givenTagList.length; index++) {
      const tag = tagfromApi2ToApi(this.givenTagList[index])
      this.tagList.push(tag)
    }
  },
  methods: {
    /**
     * tagListからデータを削除する
     * 削除したら、削除したタグの情報を
     */
    popTag(tag: TagToApi) {
      if (this.isEditable) {
        try {
          this.tagList = this.tagList.filter((item) => item !== tag)
          this.$emit('pop', tag)
        } catch (error) {
          console.error(error)
        }
      }
    },
  },
})
</script>
