<template>
  <!-- todo:index.vueをlogin画面にする -->
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Nikkiへようこそ </v-card-title>
        <v-card-text>
          <v-text-field v-model="userName" label="ユーザー名"> </v-text-field>
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

export default defineComponent({
  name: 'IndexPage',
  layout: 'simple',
  data() {
    return {
      showPassword: false,
      userName: '',
      password: '',
    }
  },
  methods: {
    // todo: login処理をscript/user.tsに書く
    async tryLogin() {
      await alert('login!')
    },
  },
})
</script>

