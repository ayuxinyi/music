import { ISong } from "../../services/modules/home/models/home.model"
import type { IMusic } from "../../services/modules/player/models/player.model"
import { getSongInfo, getSongLyric } from "../../services/modules/player/player.service"
import playerStore from "../../stores/playerStore"
import { ILyricInfo, parseLyric } from "../../utils/parse-lyric"
import throttle from "../../utils/throttle"

Page({
  data: {
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
    playModeName: "order"
  },
  onLoad({ id }: { id?: string } = {}) {
    // 获取播放歌曲列表
    playerStore.onStates(["playSongList", "playSongIndex"], this.handleSongInfosStore())
    // 获取屏幕高度,设置轮播图高度
    const app = getApp<IAppOption>()
    this.setData({ contentHeight: app.globalData.contentHeight })
    this.setUpPlaySong(id!)
  },
  onSwiperChange(event: WechatMiniprogram.SwiperChange) {
    const currentPage = event.detail.current
    this.setData({ currentPage })
  },
  onTabChange(event: WechatMiniprogram.BaseEvent<{ index: number }>) {
    const currentPage = event.mark!.index
    this.setData({ currentPage })
  },
  // 监听滑块改变事件
  onSliderChange(event: WechatMiniprogram.SliderChange) {
    // 获取点击时对应的位置
    const { value } = event.detail
    // 计算要播放的时间
    const currentTime = value / 100 * this.data.duration
    // 设置播放器当前时间
    audioContext.seek(currentTime / 1000)
    // 更新data中的时间
    this.setData({ currentTime })
    // 改变滑块滑动状态
    this.data.isSliderChanging = false
  },
  // 滑块滑动过程监听
  onSliderChanging: throttle(function (this: any, event: WechatMiniprogram.SliderChanging) {
    // 获取滑动过程中的值
    const { value } = event.detail
    // 计算要播放的时间
    const currentTime = value / 100 * this.data.duration
    // 更新data中的时间
    this.setData({ currentTime })
    // 修复状态,代表当前正在滑动
    this.data.isSliderChanging = true
  }, 100),
  // 更新进度
  updateProgress() {
    const { currentTime, duration } = this.data
    const sliderValue = currentTime / duration * 100
    // 记录当前的播放时间,修改滑块的进度
    this.setData({ sliderValue, currentTime: audioContext.currentTime * 1000 })
  },
  // 播放/暂停按钮监听
  onPlayTap() {
    if (!this.data.isSuccesPlay) return
    const { isPlayIng } = this.data
    if (!audioContext.paused) {
      audioContext.pause()
    } else {
      audioContext.play()
    }
    this.setData({ isPlayIng: !isPlayIng })
  },
  // store共享数据监听回调
  handleSongInfosStore() {
    return ({ playSongIndex, playSongList }: {
      playSongList?: ISong[],
      playSongIndex?: number
    } = {}) => {
      if (playSongIndex !== undefined) {
        this.setData({ playSongIndex })
      }
      if (playSongList) {
        this.setData({ playSongList })
      }
    }
  },
  changeNewSong(isNext = true) {
    // 获取歌曲相关数据
    let { playSongIndex, playSongList, playMode } = this.data
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
  },
  // 上一首点击
  onPrevTap() {
    this.changeNewSong(false)
  },
  // 下一首点击
  onNextTap() {
    this.changeNewSong()
  },
  // 模式切换
  onModeTap() {
    // 计算新的模式
    let { playMode } = this.data
    playMode++
    if (playMode === 3) playMode = 0
    audioContext.loop = playMode === PlayModeEnum.Repeat
    // 保存模式
    this.setData({ playMode, playModeName: modeNames[playMode] })
  },
  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.handleSongInfosStore())
  }
})