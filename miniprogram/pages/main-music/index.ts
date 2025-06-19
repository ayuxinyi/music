import { getBanner, getSongMenuList } from "../../services/modules/home/home.service"
import type { IBanner, IPlayList, IPlayListResponse, ISong, ITrack } from "../../services/modules/home/models/home.model"
import playerStore from "../../stores/playerStore"
import type { IPlayerInfo } from "../../stores/playerStore"
import rankingStore, { rankingIdsMap } from "../../stores/rankingStore"
import recommendStore from "../../stores/recommendStore"
import { querySelect } from "../../utils/query-select"
import throttle from "../../utils/throttle"
import { IMusic } from "../../services/modules/player/models/player.model"

const querySelectThrottle = throttle(querySelect)
// pages/main-music/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    banners: <IBanner[]>[],
    bannerHeight: 130,
    tracks: <ITrack[]>[],
    hotList: <ISong[]>[],
    recHotList: <ISong[]>[],
    // 新歌榜
    rankingInfos: <{
      newRanking: IPlayListResponse
      originRanking: IPlayListResponse
      upRanking: IPlayListResponse
    }>{},
    isRankingData: false,
    currentSong: <IMusic>{},
    isPlayIng: true,
    ctx: <WechatMiniprogram.CanvasContext>{},
    duration: 0,
    currentTime: 0,
    center: 13,
    radius: 11,
    isFirstDraw: true
  },
  // 搜索区域点击
  onSearchClick() {
    wx.navigateTo({ url: "/pages/detail-search/index" })
  },
  onLoad() {
    this.fetchBanner()
    this.fetchHotList()
    // 监听数据，推荐歌曲store
    recommendStore.onState("recommendSongsInfo", this.handleStoreState())
    // 发起action
    recommendStore.dispatch("fetchRecommendSongsAction")
    // 歌单数据
    for (const key in rankingIdsMap) {
      rankingStore.onState(key, this.handleRankingState(key))
    }
    rankingStore.dispatch("fetchRankingList")
    // 获取播放歌曲的信息
    playerStore.onStates(["currentSong", "isPlayIng", "currentTime", "duration"], this.handlePlayMusicInfo())
  },
  onUnload() {
    recommendStore.offState("recommendSongsInfo", this.handleStoreState())
    for (const key in rankingIdsMap) {
      rankingStore.offState(key, this.handleRankingState(key))
    }
    playerStore.offStates(["currentSong", "isPlayIng", "currentTime", "duration"], this.handlePlayMusicInfo())
  },
  handleRankingState(type: string = 'newRanking') {
    return (value: IPlayListResponse) => {
      const newRankingInfos = { ...this.data.rankingInfos, [type]: value }
      this.setData({ rankingInfos: newRankingInfos, isRankingData: true })
    }
  },
  handleStoreState() {
    return (value: IPlayList) => {
      const tracks = value.tracks ?? []
      this.setData({ tracks: tracks.slice(0, 6) })
    }

  },
  // 获取轮播图
  async fetchBanner() {
    const res = await getBanner()
    this.setData({ banners: res.banners })
  },
  fetchHotList() {
    getSongMenuList().then(res => {
      this.setData({ hotList: res.playlists })
    })
    getSongMenuList("华语").then(res => {
      this.setData({
        recHotList: res.playlists
      })
    })

  },
  // 监听图片加载
  async onBannerImageLoad() {
    const res = await querySelectThrottle(".image")
    this.setData({
      bannerHeight: res[0].height
    })
  },
  // 更多按钮点击
  onRecomendMoreTap() {
    wx.navigateTo({
      url: "/pages/detail-songs/index?type=recommend&key=recommendSongsInfo"
    })
  },
  // 推荐歌曲点击监听
  onSongTap(event: WechatMiniprogram.BaseEvent<{ index: number }>) {
    const index = event.mark?.index
    // 存储数据
    playerStore.setState("playSongList", this.data.tracks)
    playerStore.setState("playSongIndex", index)
  },
  // 获取播放歌曲信息
  handlePlayMusicInfo() {
    return ({ currentSong, isPlayIng, currentTime, duration }: Partial<IPlayerInfo> = {}) => {
      if (currentSong) {
        this.data.isFirstDraw = true
        if (Object.keys(this.data.ctx).length > 0) {
          this.drawCircle()
        }
        this.setData({ currentSong })
      }
      if (isPlayIng !== undefined) {
        this.setData({ isPlayIng })
      }
      if (duration !== undefined) {
        this.setData({ duration })
      }
      if (currentTime !== undefined) {
        this.setData({ currentTime })
        if (currentTime !== 0) {
          this.initCanvas()
        }
      }
    }
  },
  onPlayMusicStaus() {
    playerStore.dispatch("playMusicStateAction")
  },
  initCanvas() {
    if (this.data.isFirstDraw) {
      const query = wx.createSelectorQuery();
      query.select('#canvas')
        .fields({
          node: true,
          size: true,
        })
        .exec((res: any) => {
          if (!res[0]) return;
          this.data.isFirstDraw = false
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          // 适配高清屏
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);

          // 保存 Canvas 和上下文
          this.setData({ canvas, ctx });
          this.drawCircle()
          this.updateProgess()
        })
    } else {
      this.drawCircle()
      this.updateProgess()
    }
  },
  drawCircle() {
    const { center, radius, ctx } = this.data
    console.log(center)
    ctx.clearRect(0, 0, center * 2, center * 2)
    // 绘制初始圆
    ctx.beginPath();
    ctx.lineWidth = 2
    ctx.strokeStyle = "#ccc"
    ctx.arc(center, center, radius, 0, Math.PI * 2); // 0~2π 弧度
    ctx.stroke();
  },
  updateProgess() {
    if (!this.data.ctx.strokeStyle) return
    const { center, radius } = this.data
    const { ctx, currentTime, duration } = this.data
    const progress = currentTime / duration
    console.log(progress, currentTime, duration)
    ctx.beginPath();
    ctx.arc(
      center,
      center,
      radius,
      -Math.PI / 2,                   // 从 -90° 开始（顶部）
      -Math.PI / 2 + Math.PI * 2 * progress // 根据进度计算结束角度
    );
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.stroke();
  },
  onBindAlbumTap() {
    wx.navigateTo({
      url: "/pages/music-player/index"
    })
  }
})