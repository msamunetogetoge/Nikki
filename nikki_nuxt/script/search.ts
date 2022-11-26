// todo: class SearchParams  を作る
// todo: axios.post("/search/nikki", searchParams) -> Array<NikkiFromApi> をする関数を作る



import axios from "axios"

import { UrlBuilder } from "./url"

import { initId } from "~/store"
import { NikkiFromApi } from "./nikki"

export class SearchParams {
    created_by: number | undefined
    to_date: Date | undefined
    from_date: Date | undefined
    title_or_contens: string | undefined
    goodness_min: number | undefined
    goodness_max: number | undefined
    constructor(createdBy: number | undefined, toDate: Date = new Date(), fromDate: Date | undefined, titleOrContents: string | undefined, goodnessMin: number | undefined, goodnessMax: number | undefined) {
        if (createdBy === undefined) {
            this.created_by = initId
        } else {
            createdBy = this.created_by
        }
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