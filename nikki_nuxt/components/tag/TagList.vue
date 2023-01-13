<template>
  <v-card class="mx-auto" max-width="300" tile>
    <v-list dense>
      <v-list-item v-for="(tag, i) in tagList" :key="i">
        <v-list-item-content>
          <tag-component
            :name-given="tag.name"
            :tag-id="tag.id"
            :created-by="tag.created_by"
            @clickTag="popTag"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagToApi } from '../../script/tag'
import TagComponent from '../tag/TagComponent.vue'

export default defineComponent({
  components: {
    TagComponent,
  },
  props: {
    givenTagList: {
      type: Array,
      default: () => {
        return [] as Array<TagToApi>
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
  watch: {
    givenTagList(val: Array<TagToApi>) {
      this.tagList = val
    },
  },
  mounted() {
    this.tagList = this.givenTagList as Array<TagToApi>
  },
  methods: {
    /**
     * tagListからデータを削除する
     * 削除したら、削除したタグの情報を
     */
    popTag(tag: TagToApi) {
      if (this.isEditable) {
        try {
          this.tagList = this.tagList.filter((item) => item.id !== tag.id)
          this.$emit('pop', tag)
        } catch (error) {
          console.error(error)
        }
      }
    },
  },
})
</script>
