import axios, { AxiosResponse } from "axios"
import { UrlBuilder } from "./url"


const url = "login"

/**
 * login処理の時に使うinterface
 */
interface Login {
    user_id: string
    password: string
}

/**
 * nuxtのstoreに保存する情報を格納するinterface
 */
export interface UserStore {
    id: number
    user_id: string
    user_name: string
}

/**
 * login 処理。成功なら何も返さず、失敗なら例外をthrowする。
 * @param userId  ユーザーID
 * @param password パスワード
 * @return UserStore or exception
 */
export async function login(userId: string, password: string): Promise<UserStore> {
    let userInfo: UserStore = {
        id: -100,
        user_id: userId,
        user_name: ""
    }
    const loginInfo: Login = {
        user_id: userId,
        password
    }
    const urlBuilder = new UrlBuilder(url, undefined, undefined)
    await axios.post(urlBuilder.buildUrl(), loginInfo).then(
        function (response: AxiosResponse<UserStore>) {
            userInfo = response.data

        }
    ).catch(function (error) {
        console.error(error)
        throw error
    })
    return userInfo
}

/**
 * 仮のユーザー情報を取得する。
 * @returns ランダムな文字列で構成されたUserStore
 */
export async function getTrialLoginInfo(): Promise<UserStore> {
    let userInfo: UserStore = {
        id: -100,
        user_id: "",
        user_name: ""
    }
    const urlBuilder = new UrlBuilder("random", undefined, undefined)
    await axios.get(urlBuilder.buildUrl()).then(
        function (response: AxiosResponse<UserStore>) {
            userInfo = response.data
        }
    ).catch(function (error) {
        console.error(error)
        throw error
    })
    return userInfo
}
/**
 * 登録せずに使用しているユーザー情報を削除する。
 * @param userId  ユーザーのid(user_idでなくてid)
 */
export async function deleteTrialLoginUser(userId: string): Promise<void> {
    const urlBuilder = new UrlBuilder("user", undefined, userId)
    await axios.delete(urlBuilder.buildByPathParameter()).then().catch(function (error) {
        throw error
    })
}