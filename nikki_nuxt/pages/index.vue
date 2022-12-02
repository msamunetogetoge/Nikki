<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Nikkiへようこそ </v-card-title>
        <v-card-text>
          <v-text-field v-model="userId" label="ユーザーID"> </v-text-field>
          <v-text-field
            v-model="password"
            label="パスワード"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword"
          >
          </v-text-field>
          <p>Nikkiを書きましょう</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="tryLogin"> ログイン </v-btn>
          <v-btn color="success" nuxt to="/signup"> 新規登録 </v-btn>
          <v-btn color="secondly" @click="noLoginNikki"> 登録せずに試す </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { login, UserStore, getTrialLoginInfo } from '../script/login'
import { initId } from '../store'

export default defineComponent({
  name: 'IndexPage',
  layout: 'simple',
  data() {
    return {
      showPassword: false,
      userId: '',
      id: initId,
      logedIn: false,
      userName: '',
      password: '',
    }
  },
  mounted() {},
  methods: {
    /**
     * ログイン処理をする。
     * 成功すれば、ユーザー情報をstoreにセットして、/home に遷移する
     */
    async tryLogin() {
      try {
        // todo: #44 ログイン -> ログアウトせずにお試しログイン とするとログインしたユーザー(お試しでない)のNikkiが表示される。
        // 逆も然りだが、/homeをリロードすると正しい挙動に戻る
        const userInfo: UserStore = await login(this.userId, this.password)
        this.userId = userInfo.user_id
        this.id = userInfo.id
        this.userName = userInfo.user_name
        await this.setUserInfo()
        this.$router.push('/home')
      } catch (error) {
        alert('login失敗')
      }
    },
    /**
     * 新規登録せずにNikkiを始める
     */
    async noLoginNikki() {
      try {
        const userInfo: UserStore = await getTrialLoginInfo()
        this.userId = userInfo.user_id
        this.id = userInfo.id
        this.userName = userInfo.user_name
        await this.setTrialUserInfo()
        this.$router.push('/home')
      } catch (error) {
        console.error(error)
        alert('login失敗')
      }
    },
    /**
     * ユーザーの情報をstore()にセットする
     * 注意:storeの方でlocalStorageも使っている
     */
    setUserInfo() {
      // 変なことが起きないように、お試しユーザーはログアウトする。
      this.$accessor.logoutTrial()
      this.$accessor.setId(this.id)
      this.$accessor.setUserId(this.userId)
      this.$accessor.setUserName(this.userName)
      this.$accessor.login()
    },
    /**
     * お試しユーザーの情報をstoreにセットする
     * 注意:storeの方でlocalStorageも使っている
     * todo: 新規登録なしで利用していたら、登録する時にdbでupdateを発行するようにする
     */
    setTrialUserInfo() {
      // 変なことが起きないように、普通のユーザーはログアウトする。
      this.$accessor.logout()
      this.$accessor.setId(this.id)
      this.$accessor.setUserId(this.userId)
      this.$accessor.setUserName(this.userName)
      this.$accessor.loginTrial()
    },
  },
})
</script>

