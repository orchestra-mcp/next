// Standardized API response envelope — shared between web and mobile

export interface ApiMeta {
  total: number
  limit: number
  offset: number
}

/** Single resource response: { data: T, meta?: ApiMeta } */
export interface ApiResource<T> {
  data: T
  meta?: ApiMeta
}

/** Collection response: { data: T[], meta: ApiMeta } */
export interface ApiList<T> {
  data: T[]
  meta: ApiMeta
}
