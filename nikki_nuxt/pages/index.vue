<template>
  <!-- todo:index.vueをlogin画面にする -->
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Nikkiへようこそ </v-card-title>
        <v-card-text>
          <v-text-field v-model="userId" label="ユーザー名"> </v-text-field>
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
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { login, UserStore } from '../script/login'

export default defineComponent({
  name: 'IndexPage',
  layout: 'simple',
  data() {
    return {
      showPassword: false,
      userId: '',
      id: -10,
      logedIn: false,
      userName: '',
      password: '',
    }
  },
  methods: {
    // todo:home.vueで表示する情報に関する事で、userId ,userNameを参照している場所はを、storeからの参照に書き換える
    /**
     * ログイン処理をする。
     * 成功すれば、ユーザー情報をstoreにセットして、/home に遷移する
     */
    async tryLogin() {
      try {
        const userInfo: UserStore = await login(this.userId, this.password)
        this.userId = userInfo.user_id
        this.id = userInfo.id
        this.userName = userInfo.user_name
        this.setUserInfo()
        this.$router.push('/home')
      } catch (error) {
        alert('login失敗')
      }
    },
    /**
     * ユーザーの情報をstoreにセットする
     */
    setUserInfo() {
      this.$accessor.setId(this.id)
      this.$accessor.setUserId(this.userId)
      this.$accessor.setUserName(this.userName)
      this.$accessor.login()
    },
  },
})
</script>

