import axios, { AxiosError, AxiosResponse } from "axios"
import { UrlBuilder, Query, UrlBuilder } from "./url"

interface TagToApi {
    id: number | null
    created_by: string
    name: string
}

export interface TagFromApi {
    id: number
    created_by: string
    name: string
}
export class TagToBackEnd implements TagToApi {
    id: number | null
    created_by: string
    name: string
    constructor(id: number | null, createdBy: string, name: string) {
        this.id = id
        this.created_by = createdBy
        this.name = name
    }

}

export class TagFromBackEnd {
    tags: TagFromApi[]
    constructor(tags: TagFromApi[]) {
        this.tags = tags
    }

}

const url = "tag"

export async function getTagsFromCreatedBy(createdBy: string): Promise<TagFromBackEnd> {
    const urlBuilder = new UrlBuilder(url, undefined, createdBy)
    const tags = axios.get(urlBuilder.buildByPathParameter()).then(
        function (response: AxiosResponse<TagFromBackEnd>) {
            return response.data
        }).catch(function (error) {
            throw error
        })
    return await tags
}