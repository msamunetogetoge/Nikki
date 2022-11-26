// todo: axios.post("/search/nikki", searchParams) -> Array<NikkiFromApi> をする関数を作る->テストする



import axios from "axios"

import { UrlBuilder } from "./url"
import { NikkiFromApi, NikkiFromBackEnd } from "./nikki"

import { initId } from "~/store"


export class SearchParams {
    created_by: number
    to_date: string
    from_date: string | undefined
    title_or_contents: string
    goodness_min: number
    goodness_max: number
    constructor(createdBy: number = initId, toDate: Date = new Date(), fromDate: Date | undefined = undefined, titleOrContents: string = "", goodnessMin: number = 0, goodnessMax: number = 10) {
        this.created_by = createdBy
        this.to_date = toDate.toUTCString()
        this.from_date = (fromDate === undefined) ? undefined : fromDate.toUTCString()
        this.title_or_contents = titleOrContents
        this.goodness_max = goodnessMax
        this.goodness_min = goodnessMin
    }
}

const url = "/search/nikki"
export async function getNikkiByParams(searchParams: SearchParams): Promise<Array<NikkiFromApi>> {
    const urlBuilder = new UrlBuilder(url)
    const nikkis: NikkiFromBackEnd = await axios.post(urlBuilder.buildUrl(), searchParams).then(function (response) {
        return JSON.parse(response.data)
    }).catch(function (error) {
        throw error
    })

    return nikkis.nikkis

}