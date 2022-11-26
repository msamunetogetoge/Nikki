// todo: axios.post("/search/nikki", searchParams) -> Array<NikkiFromApi> をする関数を作る->テストする



import axios from "axios"

import { UrlBuilder } from "./url"
import { NikkiFromApi } from "./nikki"

import { initId } from "~/store"


export class SearchParams {
    created_by: number
    to_date: Date
    from_date: Date | undefined
    title_or_contens: string
    goodness_min: number
    goodness_max: number
    constructor(createdBy: number = initId, toDate: Date = new Date(), fromDate: Date | undefined = undefined, titleOrContents: string = "", goodnessMin: number = 0, goodnessMax: number = 10) {
        this.created_by = createdBy
        this.to_date = toDate
        this.from_date = fromDate
        this.title_or_contens = titleOrContents
        this.goodness_max = goodnessMax
        this.goodness_min = goodnessMin
    }
}

const url = "/search/nikki"
export async function getNikkiByParams(searchParams: SearchParams): Promise<Array<NikkiFromApi>> {
    const urlBuilder = new UrlBuilder(url)
    const nikkis: Array<NikkiFromApi> = await axios.post(urlBuilder.buildUrl(), searchParams).then(function (response) {
        return JSON.parse(response.data).nikkis
    }).catch(function (error) {
        throw error
    })
    return nikkis

}