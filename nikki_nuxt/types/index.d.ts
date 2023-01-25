import { accessorType } from '~/store'

declare module 'vue/types/vue' {
    interface Vue {
        $accessor: typeof accessorType
    }
}

declare module '@nuxt/types' {
    interface NuxtAppOptions {
        $accessor: typeof accessorType
    }
}

export interface MenuIcon {
    icon: string
    title: string,
    to: string | undefined,
    action: (() => void) | undefined
}

