<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">ユーザー情報変更 </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="userId"
              label="ユーザーID"
              :rules="[rules.required]"
            >
            </v-text-field>
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
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" :disabled="!valid" @click="updateUser">
            登録
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { updateUserInfo } from '../script/user'

export default defineComponent({
  name: 'UserPage',
  layout: 'simple',
  middleware: 'auth-trial-or-login',
  data() {
    return {
      valid: true,
      showPassword1: false,
      showPassword2: false,
      userId: '',
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
  mounted() {
    this.userId = this.$accessor.userId
    this.userName = this.$accessor.userName
  },

  methods: {
    /**
     * バリデーション
     */
    validate() {
      const formElement: any = this.$refs.form
      formElement.validate()
    },
    /**
     * ユーザー登録する。
     * alertで成功、失敗を教える。
     */
    async updateUser() {
      try {
        await updateUserInfo(
          undefined,
          this.$accessor.id,
          this.userId,
          this.userName,
          this.password1
        )
        alert('登録しました。登録した情報でログインしてください。')
        this.$router.push('/')
      } catch (error) {
        console.error(error)
        alert('登録に失敗しました。')
      }
    },
  },
})
</script>

