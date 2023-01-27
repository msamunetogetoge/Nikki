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
          :disable="item.disable"
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
import { MenuIcon } from '../types/index'

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
      goodness: 10,
      createdBy: initId,
      // nikki作成の為の変数終わり
      dialog: false, // nikki作成ダイアログの出現フラグ
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
          to: undefined,
          action: () => {
            alert('登録すると使えます。')
          },
        },
        {
          icon: 'mdi-notebook-plus',
          title: 'Nikki',
          to: undefined,
          action: this.showNikkiDialog,
        },
        {
          icon: 'mdi-account-circle',
          title: '登録して使う',
          to: undefined,
          action: this.trialSignUp,
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
    // NikkiDialogを選ぶ
    showNikkiDialog() {
      this.dialog = true
      this.drawer = !this.drawer
    },
    /**
     * トライアルユーザーを登録ページに送る。
     */
    trialSignUp() {
      this.$router.push('/user')
    },
    // ログアウト処理をする
    async tryLogout() {
      try {
        const userId: string = this.$accessor.userId
        this.$accessor.logout()
        this.$accessor.logoutTrial()
        await deleteTrialLoginUser(userId)
        this.$router.go(0) // middleware が監視していて、login画面に戻る。再読み込みする事でlocalStorageの値も教える事が出来て一石二鳥。
      } catch (error) {
        console.error(error)
        alert('ログアウト失敗')
      }
    },
    calculateWindowWidth() {
      this.permanent = window.innerWidth > 768
    },
  },
})
</script>
