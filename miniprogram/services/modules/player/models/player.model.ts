interface Ar {
  id: number
  name: string
}
interface Al {
  id: number
  name: string
  picUrl: string
  tns: any[]
  pic_str: string
  pic: number
}

export interface IMusic {
  name: string
  id: number
  ar: Ar[]
  pop: number
  st: number
  fee: number
  v: number
  al: Al
  dt: number
}

export interface IMusicResponse {
  code: number
  msg: string
  songs: IMusic[]
}

export interface ILyric {
  version: number
  lyric: string
}

export interface ILyricResponse {
  lrc: ILyric
  code: number
  msg: string
}