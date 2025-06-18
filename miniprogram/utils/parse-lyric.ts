export interface ILyricInfo {
  time: number
  text: string
}
export function parseLyric(lyric: string): ILyricInfo[] {
  const lyricInfos: ILyricInfo[] = []
  const lyricLines = lyric.split("\n")
  // lyricLine:[00:00.11]歌词文本
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
  for (const lyricLine of lyricLines) {
    const res = timeReg.exec(lyricLine)
    if (!res) continue
    const minute = (Number(res?.[1]) ?? 0) * 60 * 1000
    const second = (Number(res?.[2]) ?? 0) * 1000
    const mSecond = res?.[3]?.length === 2 ? (Number(res?.[3]) ?? 0) * 10 : +(Number(res?.[3]) ?? 0)
    const time = minute + second + mSecond
    const text = lyricLine.replace(timeReg, "")
    const lyricInfo: ILyricInfo = {
      time,
      text
    }
    lyricInfos.push(lyricInfo)
  }
  return lyricInfos
}