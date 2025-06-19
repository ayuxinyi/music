import type { ISong } from "../../services/modules/home/models/home.model"
import type { IMusic } from "../../services/modules/player/models/player.model"
import type { IPlayerInfo } from "../../stores/playerStore"
import playerStore, { audioContext, PlayModeEnum } from "../../stores/playerStore"
import type { ILyricInfo } from "../../utils/parse-lyric"
import throttle from "../../utils/throttle"

Page({
  data: {
    stateKeys: ["id", "currentSong", "lyric", "duration", "currentTime", "currentLyricText", "currentLyricIndex", "isPlayIng", "playModeName"],
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
    isPlayIng: true,
    // 页面相关
    currentPage: 0,
    contentHeight: 603,
    pageTitles: ["歌曲", "歌词"],
    sliderValue: 0,
    // 是否正在滑动
    isSliderChanging: false,
    // 歌词动画时长
    textTime: 0,
    // 歌词滚动距离
    lyricScrollTop: 0,
  },
  onLoad({ id }: { id?: string } = {}) {
    // 监听store中歌曲列表的变化
    playerStore.onStates(["playSongList", "playSongIndex"], this.handleSongInfosStore())
    // 监听store中歌曲信息的改变,重新给data中的数据进行赋值,更改界面
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfos())
    // 获取屏幕高度,设置轮播图高度
    const app = getApp<IAppOption>()
    this.setData({ contentHeight: app.globalData.contentHeight })
    // 调用store中的action播放歌曲
    if (id) {
      playerStore.dispatch("playMusicWidthIdAction", id)
    }
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
  updateProgress(currentTime: number) {
    if (this.data.isSliderChanging) return
    const sliderValue = currentTime / this.data.duration * 100
    // 记录当前的播放时间,修改滑块的进度
    this.setData({ sliderValue, currentTime })
  },
  // 播放/暂停按钮监听
  onPlayTap() {
    playerStore.dispatch("playMusicStateAction")
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
  getPlayerInfos() {
    // 监听store中的state的变化,根据最新的值改变data中的数据
    return ({ id, currentSong, duration, currentTime, currentLyricIndex, currentLyricText, lyric, isPlayIng, playModeName }: Partial<IPlayerInfo> = {}) => {
      if (id !== undefined) {
        this.setData({ id })
      }
      if (currentSong) {
        this.setData({ currentSong })
      }
      if (currentLyricText) {
        this.setData({ currentLyricText })
      }
      if (isPlayIng !== undefined) {
        // 更改按钮图片
        this.setData({ isPlayIng })
      }
      if (playModeName) {
        // 更改模式图片

        this.setData({ playModeName })
      }
      if (lyric) {
        this.setData({ lyric })
      }
      if (duration !== undefined) {
        this.setData({ duration })
      }
      if (currentTime !== undefined) {
        // 根据当前时间改变进度条进度
        this.updateProgress(currentTime)
      }
      if (currentLyricIndex !== undefined) {
        // 修改歌词滚动距离
        this.setData({ currentLyricIndex, lyricScrollTop: 40 * currentLyricIndex })
      }
    }
  },
  // 上一首点击
  onPrevTap() {
    playerStore.dispatch("changeCurrentMusicPlayAction", false)
  },
  // 下一首点击
  onNextTap() {
    playerStore.dispatch("changeCurrentMusicPlayAction")
  },
  // 模式切换
  onModeTap() {
    playerStore.dispatch("changeMusicPlayModeAction")
  },
  onUnload() {
    playerStore.offStates(["playSongList", "playSongIndex"], this.handleSongInfosStore())
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfos())
  }
})