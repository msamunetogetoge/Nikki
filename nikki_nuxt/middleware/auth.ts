import { Middleware, Context } from '@nuxt/types'


/**
 * /home, /searchに来た時に、ログイン済みなら何もせず、そうでない時はログイン画面に飛ばす
 * @param param0 
 */
const checkLogin: Middleware = ({ redirect, app: { $accessor } }: Context) => {
    if ($accessor.logedIn as boolean) {
        // ログイン済みのユーザー
    } else {
        // ログインしてないユーザー
        redirect("/")
    }
}
export default checkLogin