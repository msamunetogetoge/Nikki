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
      <v-spacer> </v-spacer>
      <v-btn @click="tryLogout">
        <v-icon> mdi-logout</v-icon>
        ログアウト
      </v-btn>
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
import { deleteTrialLoginUser } from '../script/login'
import NikkiDialog from '../components/NikkiDialog.vue'
import { initId } from '../store'

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
      createdBy: initId,
      // nikki作成の為の変数終わり
      dialog: false, // nikki作成ダイアログの出現フラグ
      clipped: false, // 左側にメニューアイコンを出すかのフラグ
      drawer: false, // メニュー表示のフラグ
      permanent: window.innerWidth > 768, // スマートフォンかどうかの判別
      fixed: false, // footer を下に止めておくかのフラグ
      items: [
        // メニューに表示する項目
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/home',
        },
        {
          icon: 'mdi-magnify',
          title: 'Search',
          to: '/search',
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
    this.createdBy = this.$accessor.id
    // 画面の大きさが変わった時に、自動でレイアウトを変更するイベントを追加
    window.addEventListener('resize', this.calculateWindowWidth)
  },
  methods: {
    // ログアウト処理をする
    async tryLogout() {
      if ((this.$accessor.logedInTrial as boolean) === true) {
        try {
          const userId: string = this.$accessor.userId
          this.$accessor.logoutTrial()
          await deleteTrialLoginUser(userId)
          this.$router.push('/')
        } catch (error) {
          console.error(error)
          alert('ログアウト失敗')
        }
      } else if ((this.$accessor.logedIn as boolean) === true) {
        this.$accessor.logout()
        this.$router.push('/')
      } else {
        alert('予期せぬエラーが発生しました。ログイン画面に戻ります。')
        this.$router.push('/')
      }
    },
    calculateWindowWidth() {
      this.permanent = window.innerWidth > 768
    },
  },
})
</script>
