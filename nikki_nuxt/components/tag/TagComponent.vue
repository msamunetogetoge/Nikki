<template>
  <v-chip class="ma-1" outlined @click="giveTagInfo">
    {{ name }}
  </v-chip>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { TagToApi } from '../../script/tag'
/**
 * タグを表示する。
 * event:
 * 'clickTag'... v-chip がクリックされたときに呼ばれる。親に、クリックされたタグの情報をTagToApiに詰めて渡す。
 */
export default defineComponent({
  props: {
    nameGiven: {
      type: String,
      default: () => {
        return ''
      },
    },
    createdBy: {
      type: String,
      default: () => {
        return ''
      },
    },
    tagId: {
      type: Number,
      default: () => {
        return null
      },
    },
    added: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  },
  data() {
    return {
      name: '',
    }
  },
  watch: {
    nameGiven(val) {
      this.name = val
    },
  },
  mounted() {
    this.name = this.nameGiven
  },
  methods: {
    /**
     * click されたときに、tagの情報をTagToApiに詰めて親に伝える関数
     */
    giveTagInfo() {
      const tag: TagToApi = {
        id: this.tagId,
        name: this.name,
        created_by: this.createdBy,
      }
      this.$emit('clickTag', tag)
    },
  },
})
</script>
