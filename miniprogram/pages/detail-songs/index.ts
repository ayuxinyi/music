import { getPlayList } from "../../services/modules/home/home.service"
import type { IPlayList } from "../../services/modules/home/models/home.model"
import playerStore from "../../stores/playerStore"
import rankingStore, { rankingIdsMap } from "../../stores/rankingStore"
import recommendStore from "../../stores/recommendStore"
type PageType = "ranking" | "recommend" | "album"
type KeyType = keyof typeof rankingIdsMap
// pages/detail-songs/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songInfos: <IPlayList>{},
    type: <PageType>"ranking",
    key: <KeyType>"newRanking",
    id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ type, key, id }: { type?: PageType; key?: KeyType, id?: number } = {}) {
    this.setData({
      type
    })
    // 确定需要获取数据的类型
    // - type: ranking 榜单数据,还需要获取key判断是哪个榜单
    // - type: recommend 推荐歌曲
    // - type: album 某个歌单数据 
    this.data.key = key!
    if (type === "ranking") {
      rankingStore.onState(key, this.handleRankingState())
    } else if (type === "recommend") {
      recommendStore.onState(key, this.handleRankingState())
    } else if (type === "album") {
      this.data.id = id!
      this.fetchAlbumSongsInfo()
    }
  },
  async fetchAlbumSongsInfo() {
    const res = await getPlayList(this.data.id)
    this.setData({ songInfos: res.playlist })
  },
  handleRankingState() {
    return (value: IPlayList) => {
      this.setData({ songInfos: value })
      wx.setNavigationBarTitle({
        title: value.name
      })
    }
  },
  onUnload() {
    const { type, key } = this.data
    if (type === "ranking") {
      rankingStore.offState(key, this.handleRankingState())
    } else if (type === "recommend") {
      recommendStore.offState(key, this.handleRankingState())
    }
  },
  onSongTap() {
    playerStore.setState("playSongList", this.data.songInfos.tracks)
  }
})