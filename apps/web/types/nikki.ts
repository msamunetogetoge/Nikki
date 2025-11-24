export interface NikkiFromApi {
  id: number;
  created_at: number; // Unix timestamp in seconds
  created_by: string;
  title: string;
  goodness: number;
  summary: string;
  content: string;
  tags: TagFromApi[];
}

export interface TagFromApi {
  id: number;
  name: string;
  created_by: string;
}
