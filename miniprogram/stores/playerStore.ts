import type { ISong } from "../services/modules/home/models/home.model"
import type { IMusic } from "../services/modules/player/models/player.model"
import { getSongInfo, getSongLyric } from "../services/modules/player/player.service"
import { ILyricInfo, parseLyric } from "../utils/parse-lyric"

const { HYEventStore } = require("hy-event-store")

// 通过playerStore.setData("playSongList",value) 设置state的值
// 通过playerStore.dispatch调用actions中的方法
// 通过playerStore.onState("playSongList",cb)监听state变化
// 通过playerStore.offState("playSongList",cb)取消监听
// 通过playerStore.onStates(["playSongList","playSongIndex"],cb)监听多个state变化
// 通过playerStore.offStates(["playSongList","playSongIndex"],cb)取消监听
export interface IPlayerInfo {
  id: string
  currentSong: IMusic
  lyric: ILyricInfo[]
  duration: number
  currentTime: number
  currentLyricText: string
  currentLyricIndex: number
  isPlayIng: boolean
  playModeName: string
}

export enum PlayModeEnum {
  Order = 0,    // 顺序播放
  Repeat = 1,  // 单曲循环
  Random = 2       // 随机播放
}
// 创建播放器
export const audioContext = wx.createInnerAudioContext()
// 模式名称数组
const modeNames = ["order", "repeat", "random"] as const
// 歌词匹配
function matchLyric(currentTimeMs: number, ctx: any) {
  const { lyric, currentLyricIndex } = ctx;
  if (!lyric.length) return;
  let newIndex = currentLyricIndex;
  // 正向查找（比二分法更适合歌词场景）
  while (
    newIndex < lyric.length - 1 &&
    currentTimeMs >= lyric[newIndex + 1].time
  ) {
    newIndex++;
  }
  while (newIndex > 0 && currentTimeMs < lyric[newIndex].time) {
    newIndex--;
  }
  // 更新显示
  if (newIndex !== currentLyricIndex) {
    // 改变歌词文本,歌词滚动距离
    // ctx = {
    //   ...ctx,
    //   currentLyricText: lyric[newIndex].text,
    //   currentLyricIndex: newIndex,
    //   // nextLyricText: lyric[newIndex + 1]?.text || '',
    //   textTime: ((lyric[newIndex + 1]?.time) - lyric[newIndex].time) / 1000,
    //   lyricScrollTop: 40 * newIndex
    // };
    const textTime = ((lyric[newIndex + 1]?.time) - lyric[newIndex].time) / 1000
    ctx.currentLyricText = lyric[newIndex].text
    ctx.currentLyricIndex = newIndex
    ctx.textTime = textTime
  }
}

const playerStore = new HYEventStore({
  state: {
    id: '',
    currentSong: <IMusic>{},
    lyric: <ILyricInfo[]>[],
    // 当前歌词
    currentLyricText: '',
    // 当前歌词索引值
    currentLyricIndex: -1,
    // store存储的播放歌曲列表
    playSongList: <ISong[]>[],
    playSongIndex: 0,
    // 第一次播放
    isFirstPlay: true,
    // 歌曲是否已经播放成功
    isSuccesPlay: false,
    // 播放模式
    playMode: <PlayModeEnum>0,
    playModeName: "order",
    // 当前播放时间
    currentTime: 0,
    // 总时长
    duration: 0,
    // 是否正在播放
    isPlayIng: false,
  },
  actions: {
    // 根据歌曲ID播放歌曲
    playMusicWidthIdAction(ctx: any, id: string) {
      // 重置数据
      ctx.currentSong = {}
      ctx.lyric = []
      ctx.playSongIndex = 0
      ctx.currentLyricText = ''
      ctx.currentLyricIndex = -1
      ctx.sliderValue = 0
      ctx.currentTime = 0
      ctx.duration = 0
      // 释放音频资源
      audioContext.stop();
      audioContext.seek(0);
      // 设置id
      ctx.id = id
      ctx.isPlayIng = true
      // 1.获取歌曲信息
      getSongInfo(id).then(({ songs }) => {
        ctx.currentSong = songs[0]
        ctx.duration = songs[0].dt
      })
      // 2.获取歌词信息
      getSongLyric(id).then(res => {
        // 解析歌词
        const lyric = parseLyric(res.lrc.lyric)
        ctx.lyric = lyric
      })
      // 3.播放歌曲
      // 设置音频的地址
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3&t=${Date.now()}`
      // autoplay：资源准备好以后,自动播放
      audioContext.autoplay = true
      ctx.isSuccesPlay = true
      if (ctx.isFirstPlay) {
        ctx.isFirstPlay = false
        // 4.监听播放的进度
        audioContext.onTimeUpdate(() => {
          const currentTime = audioContext.currentTime * 1000;
          ctx.currentTime = currentTime
          matchLyric(currentTime, ctx)
        })
        audioContext.onEnded(() => {
          // 如果是单曲循环,不需要切换
          if (ctx.playMode === PlayModeEnum.Repeat) return
          // 其它模式进行歌曲切换
          const _this = this as unknown as any
          _this.dispatch("changeCurrentMusicPlayAction")
        })
      }
    },
    // 改变歌曲播放状态
    playMusicStateAction(ctx: any) {
      if (!ctx.isSuccesPlay) return
      const { isPlayIng } = ctx
      if (!audioContext.paused) {
        audioContext.pause()
      } else {
        audioContext.play()
      }
      ctx.isPlayIng = !isPlayIng
    },
    // 改变歌曲播放模式
    changeMusicPlayModeAction(ctx: any) {
      // 计算新的模式
      let { playMode } = ctx
      playMode++
      if (playMode === 3) playMode = 0
      audioContext.loop = playMode === PlayModeEnum.Repeat
      // 保存模式
      // this.setData({ playMode, playModeName: modeNames[playMode] })
      ctx.playMode = playMode
      ctx.playModeName = modeNames[playMode]
    },
    // 播放下一首或者上一首
    changeCurrentMusicPlayAction(ctx: any, isNext = true) {
      // 获取歌曲相关数据
      let { playSongIndex, playSongList, playMode } = ctx
      // 计算最新的索引
      // 根据播放模式计算索引
      switch (playMode) {
        // 单曲播放
        case PlayModeEnum.Repeat:
        // 顺序播放
        case PlayModeEnum.Order:
          isNext ? playSongIndex++ : playSongIndex--
          if (playSongIndex < 0) playSongIndex = playSongList.length - 1
          if (playSongIndex >= playSongList.length) playSongIndex = 0
          break
        // 随机播放
        case PlayModeEnum.Random:
          playSongIndex = Math.floor(Math.random() * playSongList.length)
          break
      }
      // 获取最新的歌曲信息
      const newSong: IMusic = playSongList[playSongIndex]
      const _this = this as unknown as any
      // 播放歌曲
      _this.dispatch("playMusicWidthIdAction", newSong.id)
      ctx.playSongIndex = playSongIndex
    }
  }
})

export default playerStore