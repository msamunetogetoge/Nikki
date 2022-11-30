// todo: axios.post("/search/nikki", searchParams) -> Array<NikkiFromApi> をする関数を作る->テストする



import axios from "axios"

import { UrlBuilder } from "./url"
import { NikkiFromApi, NikkiFromBackEnd } from "./nikki"

import { initId } from "~/store"

/**
 * Nikki検索に使うパラメーター
 * @param created_by: number Nikki作成者id
 * @param from_date: string | undefined 日記作成日from 
 * @param to_date: string 日記作成日to
 * @param title_or_contents: string Nikkiの内容、要約、タイトル
 * @param goodness_min: number 良さ最低値
 * @param goodness_max: number 良さ最高値
 * @注意 from_date, to_date はapiに渡す時はDate.toUTCString()でフォーマットすること。
 */
export class SearchParams {
    created_by: string
    to_date: string
    from_date: string | undefined
    title_or_contents: string
    goodness_min: number
    goodness_max: number
    constructor(createdBy: string = initId, toDate: Date = new Date(), fromDate: Date | undefined = undefined, titleOrContents: string = "", goodnessMin: number = 0, goodnessMax: number = 10) {
        this.created_by = createdBy
        this.to_date = toDate.toUTCString()
        this.from_date = (fromDate === undefined) ? undefined : fromDate.toUTCString()
        this.title_or_contents = titleOrContents
        this.goodness_max = goodnessMax
        this.goodness_min = goodnessMin
    }
}

const url = "/search/nikki" // Nikki検索のapiURL

/**
 * 貰ったパラメーターでNikkiを検索する
 * @param searchParams 検索パラメーター
 * @returns Nikkiのリスト
 */
export async function getNikkiByParams(searchParams: SearchParams): Promise<Array<NikkiFromApi>> {
    const urlBuilder = new UrlBuilder(url)
    const nikkis: NikkiFromBackEnd = await axios.post(urlBuilder.buildUrl(), searchParams).then(function (response) {
        return JSON.parse(response.data)
    }).catch(function (error) {
        throw error
    })

    return nikkis.nikkis

}