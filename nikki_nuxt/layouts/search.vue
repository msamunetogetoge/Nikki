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
          @click="item.action"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
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

        <nikki-bottun v-if="!permanent" @click="dialog = true" />
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { initId } from '../store'
import { MenuIcon } from '../types/index'

export default defineComponent({
  name: 'SearchLayout',
  data: () => {
    return {
      // nikki作成の為の変数
      createdAtDisplay: new Date().toLocaleDateString('ja-japanese'),
      createdAt: new Date().toUTCString(),
      summary: '',
      content: '',
      goodness: 10,
      createdBy: initId,
      // nikki作成の為の変数終わり
      clipped: false, // 左側にメニューアイコンを出すかのフラグ
      drawer: false, // メニュー表示のフラグ
      permanent: window.innerWidth > 768, // スマートフォンかどうかの判別
      fixed: false, // footer を下に止めておくかのフラグ
      items: [] as Array<MenuIcon>,

      miniVariant: false,
      title: 'Nikki',
    }
  },
  created() {
    this.items = [
      ...[
        // メニューに表示する項目
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/home',
          action: () => {},
        },
        {
          icon: 'mdi-magnify',
          title: 'Search',
          to: '/search',
          action: () => {},
        },
        {
          icon: 'mdi-account-circle',
          title: '登録情報変更',
          to: undefined,
          action: this.userInfoPage,
        },
        {
          icon: 'mdi-logout',
          title: 'ログアウト',
          to: undefined,
          action: this.tryLogout,
        },
      ],
    ]
  },
  mounted() {
    this.createdBy = this.$accessor.id
    // 画面の大きさが変わった時に、自動でレイアウトを変更するイベントを追加
    window.addEventListener('resize', this.calculateWindowWidth)
    this.title = 'Nikki@' + this.$accessor.userName
  },
  methods: {
    // ログアウト処理をする
    tryLogout() {
      this.$accessor.logout()
      this.$accessor.logoutTrial()
      this.$router.push('/')
    },
    calculateWindowWidth() {
      this.permanent = window.innerWidth > 768
    },
    /**
     * ユーザー情報変更ページに行く
     */
    userInfoPage() {
      this.$router.push({
        path: '/user',
        params: {
          userID: this.$accessor.userId,
          userNAME: this.$accessor.userName,
        },
      })
    },
  },
})
</script>
