<template>
  <v-row>
    <v-col>
      <v-list shaped fill>
        <v-list-item v-for="(item, i) in seachedNikkiList" :key="i">
          <v-list-item-content>
            <v-card class="mx-auto" color="cyan lighten-5" max-width="800">
              <v-card-title>
                <v-icon large left> mdi-fountain-pen-tip </v-icon>
                <span class="text-h6 font-weight-light">{{ item.title }}</span>
              </v-card-title>

              <v-card-text class="text-h5 font-weight-bold">
                {{ item.summary }}
              </v-card-text>

              <v-card-actions>
                <v-list-item class="grow">
                  <v-list-item-content>
                    <v-list-item-title>{{
                      dateMilliSecondsToString(item.created_at)
                    }}</v-list-item-title>
                  </v-list-item-content>

                  <v-row align="center" justify="end">
                    <v-btn
                      icon
                      @click="displayDeleteConfirmDialog(item.id, item.title)"
                    >
                      <v-icon class="mr-3">mdi-delete </v-icon></v-btn
                    >

                    <v-icon class="mr-1"> mdi-heart </v-icon>
                    <span class="subheading mr-2">{{ item.goodness }}</span>
                    <v-btn text @click="displayNikkiDetailCard(item)">
                      詳細
                    </v-btn>
                  </v-row>
                </v-list-item>
              </v-card-actions>
            </v-card>
          </v-list-item-content>
        </v-list-item>
        <v-row> </v-row>
      </v-list>
      <!-- 詳細表示ダイアログ -->
      <v-dialog
        v-model="dialog"
        transition="dialog-bottom-transition"
        max-width="600"
      >
        <nikki-dialog
          :is-new-nikki-provided="false"
          :id-provided="id"
          :created-by-provided="createdBy"
          :title-provided="title"
          :summary-provided="summary"
          :content-provided="content"
          :created-at-provided="createdAt"
          :goodness-provided="goodness"
          :tags-provided="tags"
          @close="dialog = false"
        />
      </v-dialog>
      <!-- 削除確認ダイアログ -->
      <v-dialog
        v-model="deleteDialog"
        transition="dialog-bottom-transition"
        max-width="600"
        ><v-card>
          <v-toolbar color="primary" dark>{{ title }}</v-toolbar>
          <v-card-text class="text-lg-h5 text-sm-h5">
            削除しますか？
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="red lighten-1 " dark @click="deleteNikkiFromVue"
              >削除</v-btn
            >
            <v-btn text @click="deleteDialog = false">キャンセル</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>





<script lang="ts">
import { defineComponent } from 'vue'
import { NikkiFromApi, deleteNikki } from '../../script/nikki'
import NikkiDialog from '../../components/NikkiDialog.vue'
import { initId } from '../../store'
import { TagToApi, tagfromApi2ToApi } from '../../script/tag'
export default defineComponent({
  components: { NikkiDialog },
  props: {
    seachedNikkiList: {
      type: Array,
      default: () => {
        return [] as Array<NikkiFromApi>
      },
    },
  },
  data() {
    return {
      dialog: false, // Nikki詳細ダイアログを表示するフラグ
      deleteDialog: false, // 削除ダイアログを表示するフラグ
      deleteId: -100, // 削除ダイアログで使うNiikiのid
      // NikkiDialog で使うデータ
      id: 0,
      createdBy: initId,
      title: '',
      content: '',
      createdAt: new Date(),
      summary: '',
      goodness: 10,
      noLoginError: Error('ログインしていません。'),
      tags: [] as Array<TagToApi>,

      // NikkiDialog で使うデータ終わり
    }
  },
  mounted() {
    try {
      const createdBy = this.getUserId() as string
      this.createdBy = createdBy
    } catch (error) {
      alert('ログインしてください。')
      this.$router.push('/')
    }
  },
  methods: {
    /**
     * userIdを取得する。
     * そもそもログインしていなかったらエラーを返す
     */
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
    /**
     * apiからもらう日付データを調整する
     */
    dateMilliSecondsToString(second: number): string {
      const date = new Date(second * 1000)
      return date.toLocaleDateString('ja-japanese')
    },
    /**
     * パラメーターを更新して、Nikkiの詳細を表示する
     */
    displayNikkiDetailCard(nikki: NikkiFromApi) {
      this.dialog = false
      this.title = nikki.title
      this.id = nikki.id
      this.content = nikki.content
      this.createdAt = new Date(nikki.created_at * 1000)
      this.summary = nikki.summary
      this.goodness = nikki.goodness
      const tagToApis = [] as Array<TagToApi>
      for (let index = 0; index < nikki.tags.length; index++) {
        const tagToApi = tagfromApi2ToApi(nikki.tags[index])
        tagToApis.push(tagToApi)
      }
      this.tags = tagToApis
      this.dialog = true
    },
    /**
     * 削除確認ダイアログを表示する
     */
    displayDeleteConfirmDialog(deleteId: number, title: string) {
      this.deleteId = deleteId
      this.title = title
      this.deleteDialog = true
    },
    /**
     * Nikkiを削除する。
     * 成否にかかわらずalertで教える。
     */
    async deleteNikkiFromVue() {
      try {
        await deleteNikki(this.deleteId)
        alert('削除しました')
      } catch {
        await alert('削除に失敗しました。')
      } finally {
        this.deleteDialog = false
      }
    },
  },
})
</script>
