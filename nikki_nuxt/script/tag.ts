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

/**
 * FromApiから、ToApiへ型変換
 * @param tag : TagFromApi 
 * @returns TagToApi
 */
export function tagfromApi2ToApi(tag: TagFromApi): TagToApi {
    return tag
}

/**
 * ToApiからFromApiへ型変換
 * @param tag TagToApi
 * @returns TagFromApi. もしもidがnullならエラーを出す
 */
export function tagToApi2FromApi(tag: TagToApi): TagFromApi | Error {
    if (tag.id === null) {
        throw new Error("tag.id がnullだった")
    }
    else {
        const tagFromApi: TagFromApi = {
            id: tag.id!,
            name: tag.name,
            created_by: tag.created_by
        }
        return tagFromApi
    }

}

const url = "/tag"
/**
 * 暗号化されたユーザーIDを受け取り、そのユーザーが作成した全てのタグを取得する。
 * @param userId :暗号化されたID
 * @returns Promise<Array<TagFromApi> | Error>
 */
export async function getAllTags(userId: string): Promise<Array<TagFromApi> | Error> {
    const query: Query[] = [{
        key: "created_by",
        value: userId
    },]
    const urlBuilder = new UrlBuilder(url, query, undefined)
    const tags = await axios.get(urlBuilder.buildByQuery()).then(
        function (response: AxiosResponse<Array<TagFromApi>>) {
            return response.data
        }
    ).catch(function (error) {
        console.error(error)
        throw error
    })
    return tags

}

/**
 * 与えられたtagNameのタグが存在するか調べる。存在すればtrueを返す。
 * @param tags :調べたいタグの配列
 * @param tagName : TagToApi.name
 * @returns 存在すればtrue
 */
export function isExistTag(tags: Array<TagToApi>, tagName: string): Boolean {
    const tagNames = tags.map(item => item.name)
    return tagNames.includes(tagName)
}