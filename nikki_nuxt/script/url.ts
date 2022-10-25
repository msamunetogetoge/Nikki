export interface Query {
    key: string
    value: string
}

export class UrlBuilder {
    private apiUrl: string = '/api/'
    private baseUrl: string
    private query: Query[]
    private pathParameter: string
    constructor(baseUrl: string, query: Query[] = [], pathParameter: string = '') {
        this.baseUrl = baseUrl
        this.query = query
        this.pathParameter = pathParameter
    }

    public buildByQuery(): string {
        let builtUrl = this.apiUrl + this.baseUrl
        builtUrl += '?'
        this.query.forEach(q => {
            builtUrl += q.key
            builtUrl += '='
            builtUrl += q.value
            builtUrl += '&'
        });
        builtUrl = builtUrl.slice(0, -1)
        return builtUrl
    }

    public buildByPathParameter(): string {
        let builtUrl = this.apiUrl + this.baseUrl
        builtUrl += '/'
        builtUrl += this.pathParameter
        return builtUrl
    }

    public buildUrl(): string {
        return this.apiUrl + this.baseUrl
    }

}


