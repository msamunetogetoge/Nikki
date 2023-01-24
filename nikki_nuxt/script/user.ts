import axios from "axios"
import { UrlBuilder } from "./url"

/**
 * ユーザー登録する時に使うインターフェイス。
 * api側(/user)にpostする時に使う。 
 * 
 */
interface User {
    id: number | undefined
    user_id: string
    user_name: string
    password: string
}
/**
 * お試しユーザーを登録する時に使うインターフェイス。
 */
interface TrialUser {
    id: number | undefined
    crypted_id: string
    user_id: string
    user_name: string
    password: string
}

/**
 * api側からユーザー情報をgetする時に使うinterface
 */
interface UserId {
    user_id: string
}


/**
 *  user 操作の為のapi url
 */
const url = 'user'

/**
 *  ユーザー登録する関数。失敗したらthrowする
 * @param id number or undefined, 自動で割り振られる
 * @param userId  ユーザーID, 重複不可
 * @param userName  ユーザー名
 * @param password  パスワード
 */
export async function registerUser(id: number | undefined, userId: string, userName: string, password: string) {
    const user: User = {
        id,
        user_id: userId,
        user_name: userName,
        password,
    }
    const urlBuilder = new UrlBuilder(url)
    await axios.post(urlBuilder.buildUrl(), user).then().catch(function (error) {
        throw error
    })
}

/**
 *  お試しユーザーを登録する関数。失敗したらthrowする
 * @param id number or undefined, 自動で割り振られる
 * @param userId  ユーザーID, 重複不可
 * @param userName  ユーザー名
 * @param password  パスワード
 */
export async function registerTrialUser(id: number | undefined, cryptedId: string, userId: string, userName: string, password: string) {
    const user: TrialUser = {
        id,
        crypted_id: cryptedId,
        user_id: userId,
        user_name: userName,
        password,
    }
    const trialUserUrl = "trial_user"
    const urlBuilder = new UrlBuilder(trialUserUrl)
    await axios.post(urlBuilder.buildUrl(), user).then().catch(function (error) {
        throw error
    })
}

/**
 * 既に存在するユーザーIDか調べる。存在すればtrue, しなければfalse
 * @param userId ユーザーID
 * @returns 既にユーザーIDが存在->true, 存在しない->false
 */
export async function isExistUser(userId: string): Promise<boolean> {
    const userIdInterface: UserId = { user_id: userId }
    const urlBuilder = new UrlBuilder(url, undefined, userIdInterface.user_id)
    const isExist: boolean = await (await axios.get(urlBuilder.buildByPathParameter())).data

    return isExist


}
