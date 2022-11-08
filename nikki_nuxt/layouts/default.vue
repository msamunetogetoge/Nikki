<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      :permanent="permanent"
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <!-- Nikki作成ボタン -->
        <v-list-item
          @click="
            dialog = true
            drawer = !drawer
          "
        >
          <v-list-item-action>
            <v-icon>{{ nikkiCreate.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="nikkiCreate.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon v-if="!permanent" @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
        <v-dialog v-model="dialog">
          <nikki-dialog
            :is-new-nikki-provided="true"
            :created-by-provided="createdBy"
            @close="dialog = false"
          />
        </v-dialog>
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { initId } from '../store/index'
import { postNikki, createNikki } from '../script/nikki'
import NikkiDialog from '../components/NikkiDialog.vue'
export default defineComponent({
  name: 'DefaultLayout',
  components: {
    NikkiDialog,
  },
  data() {
    return {
      // nikki作成の為の変数
      createdAtDisplay: new Date().toLocaleDateString('ja-japanese'),
      createdAt: new Date().toUTCString(),
      summary: '',
      content: '',
      nikkiTitle: '',
      goodness: 10,
      createdBy: 0,
      // nikki作成の為の変数終わり
      dialog: false,
      clipped: false,
      drawer: false,
      permanent: window.innerWidth > 768,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/home',
        },
      ],
      nikkiCreate: {
        icon: 'mdi-notebook-plus',
        title: 'Nikki',
      },
      miniVariant: false,
      title: 'Nikki',
    }
  },
  mounted() {
    this.nikkiTitle = this.createdAtDisplay + 'のNikki'
    // storeの値が更新されて消えた時はsessionStorageから取得する
    if (this.$accessor.id === initId) {
      this.createdBy = Number(sessionStorage.getItem('id'))
    } else {
      this.createdBy = this.$accessor.id
    }

    // 画面の大きさが変わった時に、自動でレイアウトを変更する
    window.addEventListener('resize', this.calculateWindowWidth)
  },
  methods: {
    calculateWindowWidth() {
      this.permanent = window.innerWidth > 768
    },
    async postNikki() {
      const nikki = createNikki(
        null,
        this.createdAt,
        this.createdBy,
        this.nikkiTitle,
        this.goodness,
        this.summary,
        this.content
      )
      try {
        await postNikki(nikki)
        // todo: #4  NikkiList.vue に上にスワイプしたら更新 機能をつける
        // todo: #32 nikkiを作る際、createdAtを編集できるようにする
      } catch {
      } finally {
        this.dialog = false
        this.nikkiTitle = this.createdAtDisplay + 'のNikki'
        this.content = ''
        this.summary = ''
        this.goodness = 10
      }
    },
  },
})
</script>
