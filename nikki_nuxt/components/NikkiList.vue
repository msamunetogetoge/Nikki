  <template>
  <v-list shaped fill>
    <v-list-item v-for="(item, i) in nikkiList.nikkis" :key="i">
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
                <v-btn text @click="displayNikkiDetailCard(item)"> 詳細 </v-btn>
              </v-row>
            </v-list-item>
          </v-card-actions>
        </v-card>
      </v-list-item-content>
    </v-list-item>
    <v-row>
      <!-- 詳細表示ダイアログ -->
      <v-dialog
        v-model="dialog"
        transition="dialog-bottom-transition"
        max-width="600"
      >
        <v-card>
          <v-toolbar color="primary" dark>{{ title }}</v-toolbar>
          <v-card-text>
            <form>
              <v-text-field
                v-model="createdAt"
                label="作成日"
                disabled
              ></v-text-field>

              <v-text-field
                v-model="summary"
                label="要約"
                disabled
              ></v-text-field>
              <v-text-field
                v-model="content"
                label="本文"
                disabled
              ></v-text-field>
            </form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="dialog = false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
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
    </v-row>
  </v-list>
</template>





<script lang="ts">
import { defineComponent } from 'vue'
import { NikkiFromApi, getNikki, deleteNikki } from '../script/nikki'
export default defineComponent({
  data() {
    return {
      dialog: false,
      deleteDialog: false,
      date: new Date(),
      nikkiList: [] as NikkiFromApi[],
      deleteId: -100,
      title: '',
      content: '',
      createdAt: '',
      summary: '',
    }
  },
  async mounted() {
    const date = new Date()
    this.nikkiList = (await getNikki(date, 0)).nikkis as NikkiFromApi[]
  },
  methods: {
    dateMilliSecondsToString(second: number): string {
      const date = new Date(second * 1000)
      return date.toLocaleDateString('ja-japanese')
    },
    displayNikkiDetailCard(nikki: NikkiFromApi) {
      this.title = nikki.title
      this.content = nikki.content
      this.createdAt = this.dateMilliSecondsToString(nikki.createdAt)
      this.summary = nikki.summary
      this.dialog = true
    },
    displayDeleteConfirmDialog(deleteId: number, title: string) {
      this.deleteId = deleteId
      this.title = title
      this.deleteDialog = true
    },
    async deleteNikkiFromVue() {
      console.log('sakujo sitaio ')
      try {
        await deleteNikki(this.deleteId)
        alert('sakujo!')
      } catch {
        await alert('sippai!')
      }
    },
  },
})
</script>
