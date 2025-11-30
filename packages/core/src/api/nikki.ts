export type NikkiListItem = {
  id: number
  content: string
  date: string
  tags: string[]
}

export type NikkiListResponse = {
  items: NikkiListItem[]
}
