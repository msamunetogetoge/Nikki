  <template></template>





<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return {
      dialog: false,
    }
  },
  mounted() {
    const date = new Date()
  },
  methods: {
    /**
     * apiからもらう日付データを調整する
     */
    dateMilliSecondsToString(second: number): string {
      const date = new Date(second * 1000)
      return date.toLocaleDateString('ja-japanese')
    },
  },
})
</script>
