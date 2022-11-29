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
    created_at: number // milliseconds を与える事に注意
    created_by: number
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
    // const nikki: NikkiFromApi = {
    //     id: 0,
    //     created_at: 0,
    //     created_by: 0,
    //     title: "",
    //     summary: "",
    //     content: "",
    //     goodness: 0
    // }
    return new NikkiFromBackEnd([])
}
/**
 * api からnikkiデータを取得する。
 * @param fromDate {Data} 取得開始日
 * @param maxLength {number} 何件取り出すか
 * @return {Promise<NikkiFromBackEnd[]>}
 */
export async function getNikki(fromDate: Date, createdBy: number): Promise<Array<NikkiFromApi>> {
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
    return nikkiData.nikkis
}



export async function postNikki(nikki: NikkiToBackEnd) {
    const url = 'nikki';
    const urlBuilder = new UrlBuilder(url)

    await axios.post(urlBuilder.buildUrl(), nikki).then(function () {
    }).catch(function (error) {
        console.error(error)
        throw 'post is failed';
    })
}

/**
 * Nikkiをもらったパラメータでupdateする。
 * @param nikki Nikkiのデータ。
 */
export async function editNikki(nikki: NikkiToBackEnd) {
    const url = 'nikki';
    const urlBuilder = new UrlBuilder(url, undefined, nikki.id?.toString())

    await axios.put(urlBuilder.buildByPathParameter(), nikki).then(function () {
    }).catch(function (error) {
        console.error(error)
        throw 'edit is failed';
    })
}

export async function deleteNikki(nikkiId: number) {
    const url = "/nikki";
    const urlBuilder = new UrlBuilder(url, undefined, nikkiId.toString())
    await axios.delete(urlBuilder.buildByPathParameter()).then().catch(function (error) {
        console.error(error)
        throw 'delete is failed';
    })
}