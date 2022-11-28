<template>
  <v-card>
    <v-card-title> 詳細検索 </v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <date-picker :date-picker-label="'から'" @dateUpdate="setFromDate" />
        </v-col>
        <v-col>
          <date-picker :date-picker-label="'まで'" @dateUpdate="setToDate" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="goodnessMin"
            inputmode="numeric"
            type="number"
            label="良さ最低"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="goodnessMax"
            inputmode="numeric"
            type="number"
            label="良さ最高"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="search"> 検索</v-btn>
    </v-card-actions>
  </v-card>
</template>



<script lang="ts">
import { defineComponent } from 'vue'
import DatePicker from '../common/DatePicker.vue'

export default defineComponent({
  name: 'DetailSearchComponent',
  components: {
    DatePicker,
  },

  data() {
    return {
      goodnessMin: 0,
      goodnessMax: 10,
    }
  },
  watch: {
    // text-fieldに数字が与えられたら、変な数字を数字に直して表示し、親に教える。
    goodnessMin(val: number) {
      this.goodnessMin = Number(val)
      this.$emit('updateGoodnessMin', this.goodnessMin)
    },
    // text-fieldに数字が与えられたら、変な数字を数字に直して表示し、親に教える。
    goodnessMax(val: number) {
      this.goodnessMax = Number(val)
      this.$emit('updateGoodnessMax', this.goodnessMax)
    },
  },
  mounted() {},
  methods: {
    // datepickerから日付をもらったらフォーマットして、親に教える。
    setFromDate(fromDate: Date) {
      const fromDateUTCString = fromDate.toUTCString()
      this.$emit('updateFromDate', fromDateUTCString)
    },
    // datepickerから日付をもらったらフォーマットして、親に教える。
    setToDate(toDate: Date) {
      const toDateUTCString = toDate.toUTCString()
      this.$emit('updateToDate', toDateUTCString)
    },
    // Nikki検索のフラグを送る
    search() {
      this.$emit('search')
    },
  },
})
</script>