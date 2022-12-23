import axios, { AxiosResponse } from "axios"

import { UrlBuilder, Query } from "./url"

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

const url = "/tag"
export async function getAllTags(userId: string): Promise<Array<TagFromApi> | Error> {
    const query: Query[] = [{
        key: "created_by",
        value: userId
    },]
    const urlBuilder = new UrlBuilder(url, query, undefined)
    const tags = await axios.get(urlBuilder.buildByQuery()).then(
        function (response: AxiosResponse<Array<TagFromApi>>) {
            console.log(response.data)
            return response.data
        }
    ).catch(function (error) {
        console.error(error)
        throw error
    })
    return tags

}