<!--v-dialog で囲って、表示、非表示は親側で管理して使用するのが良い -->
<template>
  <v-card>
    <v-toolbar v-if="!isNewNikki" color="primary" dark>{{ title }}</v-toolbar>
    <v-toolbar v-else color="primary" dark></v-toolbar>
    <v-card-text>
      <guru-guru :now-loading="nowLoading" />
      <form>
        <v-text-field
          v-if="isNewNikki"
          v-model="title"
          label="タイトル"
        ></v-text-field>
        <v-text-field
          v-model="createdAtDisplay"
          label="作成日"
          :readonly="isNewNikki"
        ></v-text-field>

        <v-text-field v-model="summary" label="要約"></v-text-field>
        <v-textarea v-model="content" label="本文" rows="5"></v-textarea>
        <v-slider
          v-model="goodness"
          color="orange lightnen-2"
          label="良さ"
          hint="良い日でしたか？最高なら10です。"
          min="0"
          max="10"
          thumb-label
          persistent-hint
        ></v-slider>
      </form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text @click="saveNikki">保存</v-btn>
      <v-btn text @click="closeDialog">閉じる</v-btn>
    </v-card-actions>
  </v-card>
</template>





<script lang="ts">
import { defineComponent } from 'vue'
import GuruGuru from '../components/GuruGuru.vue'
import { NikkiToBackEnd, postNikki, editNikki } from '../script/nikki'
import { initId } from '../store'

export default defineComponent({
  components: {
    GuruGuru,
  },
  props: {
    isNewNikkiProvided: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    idProvided: {
      type: Number,
      default: () => {
        return null
      },
    },
    titleProvided: {
      type: String,
      default: () => {
        return ''
      },
    },
    summaryProvided: {
      type: String,
      default: () => {
        return ''
      },
    },
    contentProvided: {
      type: String,
      default: () => {
        return ''
      },
    },
    goodnessProvided: {
      type: Number,
      default: () => {
        return 10
      },
    },
    createdAtProvided: {
      type: Date,
      default: () => {
        return new Date()
      },
    },
    createdByProvided: {
      type: Number,
      default: () => {
        return null
      },
    },
  },
  data() {
    return {
      id: 0,
      isNewNikki: false,
      createdBy: 0,
      title: '',
      summary: '',
      content: '',
      createdAt: new Date(),
      createdAtDisplay: '',
      goodness: 10,
      nowLoading: false,
    }
  },
  /**
   *  親からもらうpropが更新されたら、dataを更新する。
   */
  watch: {
    idProvided(val) {
      this.id = val
    },
    createdByProvided(val) {
      this.createdBy = val
    },
    titleProvided(val) {
      this.title = val
    },
    summaryProvided(val) {
      this.summary = val
    },
    contentProvided(val) {
      this.content = val
    },
    goodnessProvided(val) {
      this.goodness = val
    },
    createdAtProvided(val) {
      this.createdAt = val
      this.createdAtDisplay = (this.createdAt as Date).toLocaleDateString(
        'ja-jp'
      )
    },
  },
  mounted() {
    this.id = this.idProvided
    this.createdBy = this.createdByProvided
    this.isNewNikki = this.isNewNikkiProvided
    this.title = this.titleProvided
    this.summary = this.summaryProvided
    this.content = this.contentProvided
    this.goodness = this.goodnessProvided
    this.createdAt = this.createdAtProvided
    this.createdAtDisplay = (this.createdAt as Date).toLocaleDateString('ja-jp')
  },

  // todo: createdAtの部分をv-date-picker にする
  methods: {
    closeDialog() {
      this.$emit('close')
    },
    async saveNikki() {
      const dateUtc = this.createdAt.toUTCString()
      const createdBy = () => {
        if (
          this.createdBy === null ||
          this.createdBy === undefined ||
          this.createdBy === initId
        ) {
          throw new Error('ログインしてください')
        } else {
          return this.createdBy
        }
      }
      const nikki: NikkiToBackEnd = new NikkiToBackEnd(
        this.id,
        dateUtc,
        createdBy(),
        this.title,
        this.goodness,
        this.summary,
        this.content
      )
      // グルグル表示
      this.nowLoading = true
      if (this.isNewNikki) {
        // 新規登録
        try {
          await postNikki(nikki)
        } catch {
          alert('登録に失敗しました・')
        } finally {
          this.nowLoading = false
          this.$emit('close')
        }
      } else {
        // データ更新
        try {
          await editNikki(nikki)
        } catch {
          alert('登録に失敗しました・')
        } finally {
          this.nowLoading = false
          this.$emit('close')
        }
      }
    },
  },
})
</script>
