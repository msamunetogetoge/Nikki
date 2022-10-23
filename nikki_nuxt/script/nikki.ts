// todo: nikki のリストを表示する為の関数やインターフェイスを作成する
import axios, { AxiosResponse, AxiosError } from "axios"
import { UrlBuilder, Query } from "./url"

interface NikkiToApi {
    id: number | null
    createdAt: string
    createdBy: number
    title: string
    goodness: number
    summary: string
    content: string
}

export interface NikkiFromApi {
    id: number
    createdAt: number // milliseconds を与える事に注意
    createdBy: number
    title: string
    goodness: number
    summary: string
    content: string
}
// export class NikkiFromBackEnd implements NikkiFromApi {
//     id: number
//     createdAt: number
//     createdBy: number
//     title: string
//     goodness: number
//     summary: string
//     content: string
//     constructor(id: number, createdAt: number, createdBy: number, title: string, goodness: number, summary: string, content: string) {
//         this.id = id
//         this.createdAt = createdAt
//         this.createdBy = createdBy
//         this.title = title
//         this.goodness = goodness
//         this.summary = summary
//         this.content = content
//     }

//     convertCreatedAt(): Date {
//         return new Date(this.createdAt)
//     }

// }

export class NikkiFromBackEnd {
    nikkis: NikkiFromApi[]
    constructor(nikkis: NikkiFromApi[]) {
        this.nikkis = nikkis
    }

}



/**
 * 情報の無いNikkiのデータを生成する関数
 * @returns {ClassNiiki}
 */
export function createNullNikki(): NikkiFromBackEnd {
    const nikki: NikkiFromApi = {
        id: 0,
        createdAt: 0,
        createdBy: 0,
        title: "",
        summary: "",
        content: "",
        goodness: 0
    }
    return new NikkiFromBackEnd([nikki])
}
/**
 * api からnikkiデータを取得する。
 * @param fromDate {Data} 取得開始日
 * @param maxLength {number} 何件取り出すか
 * @return {Promise<NikkiFromBackEnd[]>}
 */
export async function getNikki(fromDate: Date, createdBy: number): Promise<NikkiFromBackEnd> {
    const dateUtc = fromDate.toUTCString()
    const query: Query[] = [{
        key: "from_date",
        value: dateUtc
    }, {
        key: "created_by",
        value: createdBy.toString()
    }]
    const builder = new UrlBuilder('/nikki', query, undefined)
    const url = builder.buildByQuery()
    let nikkiData = createNullNikki();

    await axios.get(url).then(function (response) {
        nikkiData = new NikkiFromBackEnd(JSON.parse(response.data))

    }).catch(function (response: AxiosError) {
        console.error(response.message);
    })
    return nikkiData
}  