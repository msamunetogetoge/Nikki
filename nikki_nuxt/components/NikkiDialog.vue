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

        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="createdAtISO"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="createdAtDisplay"
              label="作成日"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="createdAtISO"
            no-title
            scrollable
            :readonly="!isNewNikki"
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="$refs.menu.save(createdAtISO)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
        <tag-dialog :given-tag="tagsProvided" @tagAdded="saveTags" />
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
import TagList from '../components/tag/TagList.vue'
import {
  NikkiToApi,
  postNikki,
  editNikki,
  NikkiWithTagToApi,
} from '../script/nikki'
import { TagToApi, TagFromApi } from '../script/tag'
import { initId } from '../store'

/**
 *  chatGPTに生成してもらったものを少し補足
 * NikkiDialog component
 *
 * This component is used to create or edit a nikki (journal entry or diary). It
 * displays a form with fields for the title, creation date, tags, summary, content,
 * and goodness of the nikki. When the form is submitted, the component will
 * either create a new nikki or update an existing one, depending on the value of
 * the `isNewNikkiProvided` prop.
 *
 * Props:
 *   - tagsProvided: An array of tags to be displayed in the tag input field.
 *   - isNewNikkiProvided: A boolean indicating whether the component is being used to create
 *       a new nikki (true) or edit an existing one (false).
 *   - idProvided: The ID of the nikki being edited, if applicable.
 *   - titleProvided: The title of the nikki being edited, if applicable.
 *   - createdAtProvided: The creation date of the nikki being edited, if applicable.
 *
 * Events:
 *   - close-dialog: Emitted when the close button is clicked. Close this dialog by calling methods.closeDialog, finally, emit 'close'.
 *   - save-nikki: Emitted when the save button is clicked. Save Nikki by calling methods.SaveNikki, finally, emit 'close'
 */

export default defineComponent({
  components: {
    GuruGuru,
    TagList,
  },
  props: {
    tagsProvided: {
      type: Array,
      default: () => {
        return [] as Array<TagFromApi>
      },
    },
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
      type: String,
      default: () => {
        return null
      },
    },
  },
  data() {
    return {
      id: 0,
      isNewNikki: false,
      createdBy: initId,
      title: '',
      summary: '',
      content: '',
      createdAt: new Date(),
      createdAtDisplay: '',
      createdAtISO: new Date().toISOString().substr(0, 10), // v-date-picker に渡すdate
      menu: false,
      goodness: 10,
      nowLoading: false,
      tags: [] as Array<TagToApi>,
    }
  },
  /**
   *  親からもらうpropが更新されたら、dataを更新する。
   */
  watch: {
    tagsProvided(val) {
      this.tags = val
    },
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
    createdAtProvided(val: Date) {
      this.createdAt = val
      this.createdAtDisplay = val.toLocaleDateString('ja-jp')
      // createAtISOもwatchしているので、ISOStringにした時に時刻がずれないように補正する
      val.setHours(val.getHours() + 9)
      this.createdAtISO = val.toISOString().substr(0, 10)
    },

    createdAtISO(val) {
      this.createdAt = new Date(val)
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
    this.createdAtISO = (this.createdAt as Date).toISOString().substr(0, 10)
    this.tags = this.tagsProvided as Array<TagFromApi>
    console.log(this.tags)
  },

  // todo: 2022/11/1, 2022/11/8 に作ったnikki を見ると、作成日が2022/10/31 になったりするので原因を調べる
  // 同じnikkiを2回開くと直る
  methods: {
    saveTags(tags: Array<TagToApi>) {
      this.tags = tags
    },
    /**
     * このコンポーネントを閉じる
     */
    closeDialog() {
      this.$emit('close')
    },
    /**
     * Nikkiを保存する
     */
    async saveNikki() {
      const dateUtc = this.createdAt.toUTCString()
      const nikki: NikkiToApi = {
        id: this.id,
        created_at: dateUtc,
        created_by: this.createdBy,
        title: this.title,
        goodness: this.goodness,
        summary: this.summary,
        content: this.content,
      }
      const tags: Array<TagToApi> = this.tags
      const nikkiWithTag: NikkiWithTagToApi = {
        nikki,
        tags,
      }
      console.log(nikkiWithTag)

      // グルグル表示
      this.nowLoading = true
      if (this.isNewNikki) {
        // 新規登録
        try {
          await postNikki(nikkiWithTag)
        } catch {
          alert('登録に失敗しました。ログインしなおしてみてください。')
        } finally {
          this.nowLoading = false
          this.closeDialog()
        }
      } else {
        // データ更新
        try {
          await editNikki(nikkiWithTag)
        } catch {
          alert('登録に失敗しました。ログインしなおしてみてください。')
        } finally {
          this.nowLoading = false
          this.closeDialog()
        }
      }
    },
  },
})
</script>
