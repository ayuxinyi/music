import { getBanner, getSongMenuList } from "../../services/modules/home/home.service"
import type { IBanner, IPlayList, IPlayListResponse, ISong, ITrack } from "../../services/modules/home/models/home.model"
import playerStore from "../../stores/playerStore"
import rankingStore, { rankingIdsMap } from "../../stores/rankingStore"
import recommendStore from "../../stores/recommendStore"
import { querySelect } from "../../utils/query-select"
import throttle from "../../utils/throttle"

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
    isRankingData: false
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
  },
  onUnload() {
    recommendStore.offState("recommendSongsInfo", this.handleStoreState())
    for (const key in rankingIdsMap) {
      rankingStore.offState(key, this.handleRankingState(key))
    }
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
  }
})