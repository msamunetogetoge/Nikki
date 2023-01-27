import { Middleware, Context } from '@nuxt/types'

/**
 * /userにきた時、何かしらのログインをしていたら何もしない。
 * そうでない時はlogin画面に戻す
 * @param param0 
 */
const checkSomeLogin: Middleware = ({ redirect, app: { $accessor } }: Context) => {
    if ($accessor.logedInTrial as boolean) {
        // お試しユーザー
    } else if ($accessor.logedIn as boolean) {
        // ユーザー

    } else {
        // それ以外のユーザー
        redirect("/")
    }
}
export default checkSomeLogin