// todo: nikki のリストを表示する為の関数やインターフェイスを作成する
import axios, { AxiosResponse, AxiosError } from "axios"
import { UrlBuilder, Query } from "./url"

interface NikkiFromApi {
    id: number
    createdAt: number
    createdBy: number
    title: string
    goodness: number
    summary: string
    content: string
}
class ClassNikki implements NikkiFromApi {
    id: number
    createdAt: number // milliseconds を与える事に注意
    createdBy: number
    title: string
    goodness: number
    summary: string
    content: string
    constructor(id: number, createdAt: number, createdBy: number, title: string, goodness: number, summary: string, content: string) {
        this.id = id
        this.createdAt = createdAt
        this.createdBy = createdBy
        this.title = title
        this.goodness = goodness
        this.summary = summary
        this.content = content
    }

    convertCreatedAt(): Date {
        return new Date(this.createdAt)
    }

}
/**
 * 情報の無いNikkiのデータを生成する関数
 * @returns {ClassNiiki}
 */
function createNullNikki(): ClassNikki {
    return new ClassNikki(0, 0, 0, "", 0, "", "")
}
/**
 * api からnikkiデータを取得する。
 * @param fromDate {Data} 取得開始日
 * @param maxLength {number} 何件取り出すか
 * @return {Promise<ClassNikki[]>}
 */
async function getNikki(fromDate: Date, createdBy: number): Promise<ClassNikki[]> {
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
    let nikkiData = [createNullNikki()];

    await axios.get(url).then(function (response: AxiosResponse<ClassNikki[]>) {
        nikkiData = response.data
    }).catch(function (response: AxiosError) {
        console.error(response.message);
    })
    return nikkiData
}  