import { getAccessorType, getterTree, mutationTree, actionTree } from 'typed-vuex'


export const state = () => {
    return {
        id: -100 as number,
        userId: "" as string,
        userName: "" as string,
        logedIn: false as boolean
    }
}

export type RootState = ReturnType<typeof state>

export const getters = getterTree(state, {
    id: state => state.id,
    userId: state => state.userId,
    userName: state => state.userName,
    logedIn: state => state.logedIn
})

export const mutations = mutationTree(state, {
    setId(state, id: number): void {
        state.id = id
    },
    setUserId(state, userId: string): void {
        state.userId = userId
    },
    setUserName(state, userNmae: string): void {
        state.userName = userNmae
    },
    setLogedIn(state, logedIn: boolean): void {
        state.logedIn = logedIn
    }
})

export const actions = actionTree({ state, getters, mutations }, {
    login({ commit }) {
        commit('setLogedIn', true)
    },
    logout({ commit }) {
        commit('setLogedIn', false)
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