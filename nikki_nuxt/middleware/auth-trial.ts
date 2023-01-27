import { Middleware, Context } from '@nuxt/types'

/**
 * /trialにきた時、お試しユーザーなら何もしない。
 * 既に登録済みで、ログイン済みなら/homeに飛ばす
 * @param param0 
 */
const checkLoginTrial: Middleware = ({ redirect, app: { $accessor } }: Context) => {
    console.log("is-not-trial-user middleware dayo--n")
    if ($accessor.logedInTrial as boolean) {
        // お試しユーザー
    } else {
        // それ以外のユーザー
        redirect("/")
    }
}
export default checkLoginTrial