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

// todo:loginのテストをする。

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
            console.log(response.data)

        }
    ).catch(function (error) {
        console.error(error)
        throw error
    })
    return userInfo
}

