<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Nikkiに登録しましょう </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="userName"
            label="ユーザー名"
            :rules="[rules.required]"
          >
          </v-text-field>
          <v-text-field
            v-model="password1"
            label="パスワード"
            :append-icon="showPassword1 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword1 ? 'text' : 'password'"
            :rules="[rules.required, rules.min]"
            @click:append="showPassword1 = !showPassword1"
          >
          </v-text-field>
          <v-text-field
            v-model="password2"
            label="パスワード再入力"
            :append-icon="showPassword2 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword2 ? 'text' : 'password'"
            :rules="[rules.min, rules.passwordMatch(password1, password2)]"
            @click:append="showPassword2 = !showPassword2"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="registerUser"> 登録 </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SignUpPage',
  layout: 'simple',
  data() {
    return {
      showPassword1: false,
      showPassword2: false,
      userName: '',
      password1: '',
      password2: '',
      rules: {
        required: (value: string) => !!value || '必須です。',
        min: (v: string) => v.length >= 6 || '6文字以上にしてください。',
        passwordMatch: (pass1: string, pass2: string) =>
          pass1 === pass2 || `パスワードが一致しません。`,
      },
    }
  },
  methods: {
    // todo: #15 ユーザー登録処理script/user.tsに書く
    async registerUser(userName: string, password: string) {
      await alert('touroku!')
    },
  },
})
</script>

