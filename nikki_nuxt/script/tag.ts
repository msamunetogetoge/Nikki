export interface TagToApi {
    id: number | null
    created_by: string
    name: string
}

export interface TagFromApi {
    id: number
    created_by: string
    name: string
}

export function tagfromApi2ToApi(tag: TagFromApi): TagToApi {
    return tag
}

export function tagToApi2FromApi(tag: TagFromApi): TagFromApi {
    if (tag.id === null) {
        throw new Error("tag.id がnullだった")
    }
    return tag
}