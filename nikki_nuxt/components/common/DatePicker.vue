 <template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :return-value.sync="dateISO"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="dateDisplay"
        :label="datePickerLabel"
        readonly
        v-bind="attrs"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker v-model="dateISO" no-title scrollable :readonly="isReadOnly">
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
      <v-btn text color="primary" @click="$refs.menu.save(dateISO)"> OK </v-btn>
    </v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    // datapickerを使えるようにするかのフラグ false->使わない
    isReadOnly: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    // datapickerに与える初期値
    dateProvided: {
      type: Date,
      default: () => {
        return new Date()
      },
    },
    // datepicker のラベル
    datePickerLabel: {
      type: String,
      default: () => {
        return ''
      },
    },
  },

  data() {
    return {
      menu: false,
      date: new Date(),
      dateISO: new Date().toISOString(),
      dateDisplay: new Date().toLocaleDateString('ja-jp'),
    }
  },
  watch: {
    // 初期値を貰ったらセットする。
    dateProvided(val: Date) {
      this.date = val
      this.dateDisplay = val.toLocaleDateString('ja-jp')
      // createAtISOもwatchしているので、ISOStringにした時に時刻がずれないように補正する
      val.setHours(val.getHours() + 9)
      this.dateISO = val.toISOString().substr(0, 10)
    },
    // datepickerで日付を変更したら親に教える。 Date型で値を渡す。
    dateISO(val) {
      this.date = new Date(val)
      this.dateDisplay = (this.date as Date).toLocaleDateString('ja-jp')
      this.$emit('dateUpdate', this.date)
    },
  },
})
</script>
