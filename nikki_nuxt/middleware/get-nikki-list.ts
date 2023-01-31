import { Middleware, Context } from '@nuxt/types'
import { getNikki } from '~/script/nikki'

/**
 * nikkiListを取得して、storeにセットする
 * @param param0 
 */
const getNikkiList: Middleware = async ({ app: { $accessor } }: Context) => {
    const nikkiList = getNikki(new Date(), $accessor.id)
    $accessor.setNikkiList(await nikkiList)

}
export default getNikkiList