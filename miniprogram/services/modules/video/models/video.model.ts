export interface IVideoParams {
  limit?: number
  area?: string
  offset?: number
}

export interface Mv {
  id: number
  captionLanguage: string
  desc: string
  area: string
  type: string
  subType: string
  videos: Video[]
}

export interface Video {
  tagSign: TagSign
  tag: string
  url: string
  duration: number
  width: number
  height: number
  container: string
  md5: string
  check: boolean
  size?: number
}

export interface TagSign {
  br: number
  type: string
  tagSign: string
  mvtype: string
  resolution: number
}

export interface IVideo {
  id: number
  cover: string
  name: string
  playCount: number
  briefDesc: any
  desc: any
  artistName: string
  mv: Mv
}

export interface IMvInfo {
  code: number
  msg: string
  id: number
  name: string
  artistId: number
  artistName: string
  desc: any
  cover: string
  playCount: number
  subCount: number
  shareCount: number
  commentCount: number
  duration: number
  publishTime: string
  artists: IArtist[]
}

export interface IArtist {
  id: number
  name: string
  img1v1Url: string
  followed: boolean
}

export interface IVideoResponse {
  code: number
  msg: string
  data: IVideo[]
  hasMore: boolean
}

