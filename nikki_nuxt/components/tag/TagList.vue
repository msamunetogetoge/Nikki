<template>
  <v-card class="mx-auto" max-width="300" tile>
    <v-list dense>
      <v-list-item v-for="(tag, i) in tags" :key="i">
        <v-list-item-content>
          <tag-component
            :name-given="tag.name"
            :tag-id="tag.id"
            :created-by="tag.created_by"
            :added="selectedTags.includes(tag)"
            @giveTag="addTagToSelectedTags"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagFromApi, TagToApi, tagToApi2FromApi } from '../../script/tag'
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
    givenselectedTags: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
  },
  data() {
    return {
      selectedTags: [] as Array<TagFromApi>,
      name: '',
    }
  },
  mounted() {
    this.selectedTags = this.givenselectedTags as Array<TagFromApi>
  },
  methods: {
    /**
     * tag 情報を親に渡す関数。
     * tag-component からTagToApi がわたってくる
     */
    addTagToSelectedTags(tag: TagToApi) {
      try {
        const tagFromApi = tagToApi2FromApi(tag) as TagFromApi
        console.log('clicked tag')
        if (this.selectedTags.includes(tagFromApi)) {
          this.selectedTags = this.selectedTags.filter(
            (item) => item !== tagFromApi
          )
        } else {
          this.selectedTags.push(tagFromApi)
        }
        console.log('taglist emit changeTag')
        this.$emit('changeTag', this.selectedTags)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
</script>
