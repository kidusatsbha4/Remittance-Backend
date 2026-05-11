export interface QueryOptions {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}