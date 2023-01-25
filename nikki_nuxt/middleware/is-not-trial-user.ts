import { Middleware, Context } from '@nuxt/types'

/**
 * /trialにきた時、お試しユーザーなら何もしない。
 * 既に登録済みで、ログイン済みなら/homeに飛ばす
 * @param param0 
 */
const checkTrial: Middleware = ({ redirect, app: { $accessor } }: Context) => {
    if ($accessor.logedInTrial as boolean) {
        // お試しユーザー

    } else if ($accessor.logedIn as boolean) {
        // 既に登録済みで、ログイン済みのユーザー
        redirect("/home")
    } else {
        // ログインしてないユーザー
        redirect("/")
    }
}
export default checkTrial