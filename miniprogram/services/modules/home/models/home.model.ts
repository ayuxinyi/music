export interface IBanner {
  imageUrl: string
  targetId: number
  targetType: number
  titleColor: string
  typeTitle: string
  pic: string
}

export interface IBannerResponse {
  banners: IBanner[]
  msg: string
  code: number
}

// 新歌 id=3779629
// 原创 id=2884035
// 飙升 id=19723756
// 热歌 id=3778678
export type ListIdType = 3779629 | 2884035 | 19723756 | 3778678

export type CategoryType = "华语" | "流行" | "古风" | "欧美" | "全部" | "摇滚" | "民谣" | "电子" | "另类/独立" | "轻音乐" | "综艺" | "影视原声" | "ACG"

// 0:pc,1:android,2:iphone,3:ipad
export type BannerType = 0 | 1 | 2 | 3

export interface ITrack {
  name: string
  id: number
  al: {
    id: number
    name: string
    picUrl: string
    tns: any[]
    pic_str: string
    pic: number
  }
}

export interface IPlayList {
  name: string
  id: number
  coverImgUrl: string
  description: string
  tracks: ITrack[]
}
export interface IPlayListResponse {
  playlist: IPlayList
  code: number
  msg: string
  name: string
}

export interface ISong {
  name: string
  id: number
  subscribedCount: number
  trackCount: number
  cloudTrackCount: number
  coverImgUrl: string
  description: string
  playCount: number
  trackUpdateTime: number
  specialType: number
  totalDuration: number
}

export interface ISongResponse {
  playlists: ISong[],
  cat: string
  code: number
  msg: string
  more: boolean
  total: number
}

export interface ISongTag {
  activity: boolean
  createTime: number
  hot: boolean
  usedCount: number
  position: number
  category: number
  name: CategoryType
  id: number
  type: number
}

export interface ISongTagResponse {
  code: number
  msg: string
  tags: ISongTag[]
}
