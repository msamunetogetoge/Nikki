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

        <v-list-item @click="dialog = true">
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
        <v-dialog
          v-model="dialog"
          transition="dialog-bottom-transition"
          max-width="600"
        >
          <v-card>
            <v-card-title> Nikkiを作成 </v-card-title>
            <v-card-text>
              <form>
                <v-text-field
                  v-model="createdAtDisplay"
                  label="作成日"
                  readonly
                ></v-text-field>
                <v-text-field
                  v-model="nikkiTitle"
                  label="タイトル"
                ></v-text-field>
                <v-textarea v-model="content" label="本文"></v-textarea>
                <v-text-field v-model="summary" label="要約"></v-text-field>
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
              <v-btn color="primary" @click="postNikki">保存</v-btn>
              <v-btn @click="dialog = false">閉じる</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { initId } from '../store/index'
import { defineComponent } from 'vue'
import { postNikki, createNikki } from '../script/nikki'
export default defineComponent({
  name: 'DefaultLayout',
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
