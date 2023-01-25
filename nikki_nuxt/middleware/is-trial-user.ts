import { Middleware, Context } from '@nuxt/types'

/**
 * /home, /searchに来た時に、ログイン済みなら何もせず、お試しユーザーの時はお試しページに飛ばす
 * @param param0 
 */
const checkTrial: Middleware = ({ redirect, app: { $accessor } }: Context) => {
    if ($accessor.logedInTrial as boolean) {
        // お試しユーザー
        redirect("/trial")
    } else if ($accessor.logedIn as boolean) {
        // 既に登録済みで、ログイン済みのユーザー

    } else {
        // ログインしてないユーザー
        redirect("/")
    }
}
export default checkTrial