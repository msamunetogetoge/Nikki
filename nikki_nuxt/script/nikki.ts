import axios, { AxiosError } from "axios"
import { UrlBuilder, Query } from "./url"
import { TagFromApi, TagToApi } from "./tag"

export interface NikkiToApi {
    id: number | null
    created_at: string
    created_by: string
    title: string
    goodness: number
    summary: string
    content: string
}

export interface NikkiWithTagToApi {
    nikki: NikkiToApi
    tags: Array<TagToApi>
}

export interface NikkiFromApi {
    id: number
    created_at: number // milliseconds を与える事に注意
    created_by: string
    title: string
    goodness: number
    summary: string
    content: string
    tags: Array<TagFromApi>

}



/**
 * api からnikkiデータを取得する。
 * @param fromDate {Data} 取得開始日
 * @param maxLength {number} 何件取り出すか
 * @return {Promise<Array<NikkiFromApi>>}
 */
export async function getNikki(fromDate: Date, createdBy: string): Promise<Array<NikkiFromApi>> {
    const dateUtc = fromDate.toUTCString()
    const query: Query[] = [{
        key: "from_date",
        value: dateUtc
    }, {
        key: "created_by",
        value: createdBy
    }]
    const builder = new UrlBuilder('/nikki', query, undefined)
    const url = builder.buildByQuery()
    let nikkiData: Array<NikkiFromApi> = []

    await axios.get(url).then(function (response) {
        nikkiData = response.data

    }).catch(function (response: AxiosError) {
        console.error(response.message);
    })
    return nikkiData
}



export async function postNikki(nikkiWithTag: NikkiWithTagToApi): Promise<NikkiFromApi | Error> {
    const url = 'nikki';
    const urlBuilder = new UrlBuilder(url)

    const nikki = await axios.post(urlBuilder.buildUrl(), nikkiWithTag).then(function (data) {
        return data.data
    }).catch(function (error) {
        console.error(error)
        throw new Error('post is failed');
    })
    return nikki
}

/**
 * Nikkiをもらったパラメータでupdateする。
 * @param nikki Nikkiのデータ。
 */
export async function editNikki(nikkiWithTag: NikkiWithTagToApi): Promise<NikkiFromApi | Error> {
    const url = 'nikki';
    const urlBuilder = new UrlBuilder(url, undefined, nikkiWithTag.nikki.id?.toString())

    const nikki = await axios.put(urlBuilder.buildByPathParameter(), nikkiWithTag).then(function (data) {
        return data.data
    }).catch(function (error) {
        console.error(error)
        throw new Error('edit is failed');
    })
    return nikki
}

export async function deleteNikki(nikkiId: number) {
    const url = "/nikki";
    const urlBuilder = new UrlBuilder(url, undefined, nikkiId.toString())
    await axios.delete(urlBuilder.buildByPathParameter()).then().catch(function (error) {
        console.error(error)
        throw new Error('delete is failed');
    })
}