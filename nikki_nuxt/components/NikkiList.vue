  <template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <template #activator="{ on, attrs }">
      <v-list shaped>
        <v-list-item v-for="(item, i) in nikkiList.nikkis" :key="i">
          <v-list-item-content>
            <v-card class="mx-auto" color="cyan lighten-5" max-width="400">
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
                    <v-icon class="mr-1"> mdi-heart </v-icon>
                    <span class="subheading mr-2">{{ item.goodness }}</span>
                    <v-btn
                      text
                      v-bind="attrs"
                      v-on="on"
                      @click="displayNikkiDetailCard(item)"
                    >
                      詳細
                    </v-btn>
                  </v-row>
                </v-list-item>
              </v-card-actions>
            </v-card>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>

    <v-card>
      <v-toolbar color="primary" dark>{{ title }}</v-toolbar>
      <v-card-text>
        <form>
          <v-text-field
            v-model="createdAt"
            label="作成日"
            disabled
          ></v-text-field>

          <v-text-field v-model="summary" label="要約" disabled></v-text-field>
          <v-text-field v-model="content" label="本文" disabled></v-text-field>
        </form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>




<script lang="ts">
import { defineComponent } from 'vue'
import { NikkiFromApi, getNikki } from '../script/nikki'
export default defineComponent({
  data() {
    return {
      dialog: false,
      date: new Date(),
      nikkiList: [] as NikkiFromApi[],
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
    },
  },
})
</script>
