import { ISong } from "../../services/modules/home/models/home.model"
import type { IMusic } from "../../services/modules/player/models/player.model"
import { getSongInfo, getSongLyric } from "../../services/modules/player/player.service"
import playerStore from "../../stores/playerStore"
import { ILyricInfo, parseLyric } from "../../utils/parse-lyric"
import throttle from "../../utils/throttle"
// 创建audio播放上下文,播放音乐
const audioContext = wx.createInnerAudioContext()
enum PlayModeEnum {
  Order = 0,    // 顺序播放
  Repeat = 1,  // 单曲循环
  Random = 2       // 随机播放
}

const modeNames = ["order", "repeat", "random"] as const
// pages/music-player/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    currentSong: <IMusic>{},
    lyric: <ILyricInfo[]>[],
    currentPage: 0,
    contentHeight: 603,
    pageTitles: ["歌曲", "歌词"],
    // 当前播放时间
    currentTime: 0,
    // 总时长
    duration: 0,
    sliderValue: 0,
    // 是否正在滑动
    isSliderChanging: false,
    // 是否正在播放
    isPlayIng: true,
    // 当前歌词
    currentLyricText: '',
    // 当前歌词索引值
    currentLyricIndex: -1,
    // 歌词动画时长
    textTime: 0,
    // 歌词滚动距离
    lyricScrollTop: 0,
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ id }: { id?: string } = {}) {
    // 获取播放歌曲列表
    playerStore.onStates(["playSongList", "playSongIndex"], this.handleSongInfosStore())
    // 获取屏幕高度,设置轮播图高度
    const app = getApp<IAppOption>()
    this.setData({ contentHeight: app.globalData.contentHeight })
    this.setUpPlaySong(id!)
  },
  // 高效歌词匹配
  matchLyric(currentTimeMs: number) {
    const { lyric, currentLyricIndex } = this.data;
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
      this.setData({
        currentLyricText: lyric[newIndex].text,
        currentLyricIndex: newIndex,
        // nextLyricText: lyric[newIndex + 1]?.text || '',
        textTime: ((lyric[newIndex + 1]?.time) - lyric[newIndex].time) / 1000,
        lyricScrollTop: 40 * newIndex
      });
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
  updateProgress() {
    const { currentTime, duration } = this.data
    const sliderValue = currentTime / duration * 100
    // 记录当前的播放时间,修改滑块的进度
    this.setData({ sliderValue, currentTime: audioContext.currentTime * 1000 })
  },
  // 播放歌曲逻辑,根据歌曲i播放歌曲
  setUpPlaySong(id: string) {
    // 释放音频资源
    audioContext.stop();
    audioContext.seek(0);
    // 设置id
    this.data.id = id
    // 1.获取歌曲信息
    getSongInfo(id).then(({ songs }) => {
      this.setData({ currentSong: songs[0], duration: songs[0].dt })
    })
    // 2.获取歌词信息
    getSongLyric(id).then(res => {
      // 解析歌词
      const lyric = parseLyric(res.lrc.lyric)
      this.setData({ lyric })
    })
    // 3.播放歌曲
    // if (this.data.playMode === PlayModeEnum.Repeat) {
    //   console.log(444)
    //   audioContext.destroy()
    // }
    // 设置音频的地址
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3&t=${Date.now()}`
    // autoplay：资源准备好以后,自动播放
    audioContext.autoplay = true
    this.data.isSuccesPlay = true
    // this.setData({ isPlayIng: true })
    if (this.data.isFirstPlay) {
      this.data.isFirstPlay = false
      // 4.监听播放的进度
      audioContext.onTimeUpdate(() => {
        // 如果滑块正在滑动,不需要设置时间
        if (this.data.isSliderChanging) return
        // 更新歌曲进度
        this.updateProgress()
        // throttleUploadeProgress()
        // 匹配歌词
        const currentTimeMs = audioContext.currentTime * 1000;
        this.matchLyric(currentTimeMs)
      })
      // audioContext.onCanplay(() => {
      //   audioContext.play()
      // })
      // audioContext.onWaiting(() => {
      //   audioContext.pause()
      // })
      audioContext.onEnded(() => {
        if (this.data.playMode === PlayModeEnum.Repeat) return
        this.changeNewSong()
      })
    }
  },
  // 歌词匹配
  // matchLyric() {
  //   const { lyric } = this.data;
  //   if (!lyric.length) return;
  //   const currentTimeMs = audioContext.currentTime * 1000;
  //   let left = 0, right = lyric.length - 1;
  //   let index = -1;

  //   while (left <= right) {
  //     const mid = Math.floor((left + right) / 2);
  //     if (lyric[mid].time <= currentTimeMs) {
  //       index = mid;
  //       left = mid + 1;
  //     } else {
  //       right = mid - 1;
  //     }
  //   }

  //   if (index !== this.data.currentLyricIndex && index >= 0) {
  //     const nextLineTime = lyric[index + 1]?.time ?? Infinity;
  //     this.setData({
  //       currentLyricText: lyric[index].text,
  //       nextLyricText: lyric[index + 1]?.text || "",
  //       currentLyricIndex: index,
  //       textTime: (nextLineTime - lyric[index].time) / 1000
  //     });
  //   }
  // },
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
    // 获取最新的歌曲信息
    const newSong = playSongList[playSongIndex]
    playerStore.setState("playSongIndex", playSongIndex)
    // 清空之前的数据,使数据回归到初始状态
    this.setData({ currentSong: newSong as unknown as IMusic, sliderValue: 0, currentTime: 0, duration: 0 })
    // 播放歌曲
    this.setUpPlaySong(newSong.id as unknown as string)
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