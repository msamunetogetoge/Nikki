import { Middleware, Context } from '@nuxt/types'

/**
 * / にきた時、何かしらのログインをしていたら、 ログアウト処理をしてページをリロードする。
 * そうでない時は何もしない
 * @param param0 
 */
const checkSomeLogin: Middleware = ({ app: { $accessor } }: Context) => {
    if (($accessor.logedInTrial as boolean) || ($accessor.logedIn as boolean)) {
        $accessor.logout()
        $accessor.logoutTrial()
        location.reload()
    }
}
export default checkSomeLogin