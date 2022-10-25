import axios, { AxiosError } from "axios"
import { UrlBuilder, Query } from "./url"

interface NikkiToApi {
    id: number | null
    created_at: string
    created_by: number
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
export class NikkiToBackEnd implements NikkiToApi {
    id: number | null
    created_at: string // Date.ToUtcString() で変換したstring
    created_by: number
    title: string
    goodness: number
    summary: string
    content: string
    constructor(id: number | null, createdAt: string, createdBy: number, title: string, goodness: number, summary: string, content: string) {
        this.id = id
        this.created_at = createdAt
        this.created_by = createdBy
        this.title = title
        this.goodness = goodness
        this.summary = summary
        this.content = content
    }


    convertCreatedAt(): Date {
        return new Date(this.created_at)
    }

}

export class NikkiFromBackEnd {
    nikkis: NikkiFromApi[]
    constructor(nikkis: NikkiFromApi[]) {
        this.nikkis = nikkis
    }

}



/**
 * 情報の無いNikkiのデータを生成する関数
 * @returns {NikkiFromBackEnd}
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

/**
 * 
 * @param id nikkiのid(nikki作成時はnullで良い)
 * @param createdAt nikki作成日 Date.toUtcString() の書式で渡す
 * @param createdBy nikki を作成したユーザーのid
 * @param title nikkiのタイトル
 * @param goodness 0~10 10が最高
 * @param summary 要約(null で渡しても良くして、contentからapi側で自動作成できるようにするかも) 140字まで
 * @param content nikkiの中身
 * @returns NikkiToBackEnd インスタンス
 */
export function createNikki(id: number | null, createdAt: string,
    createdBy: number,
    title: string,
    goodness: number,
    summary: string,
    content: string): NikkiToBackEnd {
    return new NikkiToBackEnd(id, createdAt, createdBy, title, goodness, summary, content)

}

export async function postNikki(nikki: NikkiToBackEnd) {
    const url = 'nikki';
    const urlBuilder = new UrlBuilder(url)

    await axios.post(urlBuilder.buildUrl(), nikki).then(function () {
        console.log("成功だお")
    }).catch(function (error) {
        console.log(error)
        throw 'post is failed';
    })
}