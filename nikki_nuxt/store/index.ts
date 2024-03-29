import { getAccessorType, getterTree, mutationTree, actionTree } from 'typed-vuex'
import { NikkiFromApi } from '~/script/nikki'

/**
 * storeが初期化されているかどうか、確かめる為の初期値
 */
export const initId = ""
// localStorageのデータを扱う時に使うkey
const LOGIN = "login"
const LOGINTRIAL = "loginTrial"
const ID = "id"
const USERID = "userId"
const USERNAME = "userName"
/**
 * "true", "TRUE", "True" などを true に、それ以外をfalseに変換する
 * @param bool 変換したい文字列
 * @returns bool値
 */
function stringToBoolean(bool: string): boolean {
    return bool.toLowerCase() === "true"
}

export const state = () => {
    return {
        nikkiList: [] as Array<NikkiFromApi>,
        id: initId as string,
        userId: "" as string,
        userName: "" as string,
        logedIn: false as boolean,
        logedInTrial: false as boolean
    }
}

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
    nikkiList: state => {
        return state.nikkiList
    },
    id: state => {
        const Id = localStorage.getItem(ID)
        if (Id != null) {
            return Id
        } else {
            return state.id
        }
    },
    userId: state => {
        const UserId = localStorage.getItem(USERID)
        if (UserId != null) {
            return UserId
        } else {
            return state.userId
        }
    },
    userName: state => {
        const UserName = localStorage.getItem(USERNAME)
        if (UserName != null) {
            return UserName
        } else {
            return state.userName
        }
    },
    logedIn: state => {
        const login = localStorage.getItem(LOGIN)
        if (login != null) {
            return stringToBoolean(login)
        } else {
            return state.logedIn
        }
    },
    logedInTrial: state => {
        const login = localStorage.getItem(LOGINTRIAL)
        if (login != null) {
            return stringToBoolean(login)
        } else {
            return state.logedInTrial
        }
    }
})

export const mutations = mutationTree(state, {
    deleteFromNikkiList(state, id: number) {
        const index = state.nikkiList.findIndex(item => item.id === id)
        state.nikkiList.splice(index, 1)
    },
    updateNikkiList(state, nikki: NikkiFromApi) {
        const index = state.nikkiList.findIndex(item => item.id === nikki.id)
        state.nikkiList.splice(index, 1, nikki)
    },
    addNikkiList(state, nikki: NikkiFromApi) {
        state.nikkiList.unshift(nikki)
    },
    setNikkiList(state, nikkiList: Array<NikkiFromApi>) {
        state.nikkiList = nikkiList
    },
    setId(state, id: string): void {
        state.id = id
        localStorage.setItem(ID, id)
    },
    setUserId(state, userId: string): void {
        state.userId = userId
        localStorage.setItem(USERID, userId)
    },
    setUserName(state, userNmae: string): void {
        state.userName = userNmae
        localStorage.setItem(USERNAME, userNmae)
    },
    setLogedIn(state, logedIn: boolean): void {
        state.logedIn = logedIn
        localStorage.setItem(LOGIN, logedIn.toString())

    },
    setLogedInTrial(state, logedIn: boolean): void {
        state.logedInTrial = logedIn
        localStorage.setItem(LOGINTRIAL, logedIn.toString())
    }
})

export const actions = actionTree({ state, getters, mutations }, {
    login({ commit }) {
        commit('setLogedIn', true)
    },
    /**
     * localstorage からデータを削除して、logoutする
     */
    logout({ commit }) {
        commit("setId", initId)
        commit('setLogedIn', false)
        localStorage.clear()

    },
    loginTrial({ commit }) {
        commit('setLogedInTrial', true)
    },
    /**
     * localstorage からデータを削除して、logoutする
     */
    logoutTrial({ commit }) {
        commit("setId", initId)
        commit('setLogedInTrial', false)
        localStorage.clear()


    }
})

export const accessorType = getAccessorType({
    state,
    getters,
    mutations,
    actions,
    modules: {

    },
})