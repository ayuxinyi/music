import type { IVideo } from "../../services/modules/video/models/video.model";
import { getVideo } from "../../services/modules/video/video.service";

// pages/main-video/index.ts
Page({
  data: {
    videoList: <IVideo[]>[],
    offset: 0,
    hasMore: true
  },
  onLoad() {
    this.fetchVideo()
  },
  // 监听页面滚动到底部,上拉加载
  onReachBottom() {
    // 判断是否还有数据，没有数据直接return
    if (!this.data.hasMore) return
    this.fetchVideo()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    // 清空数据
    this.data.videoList = []
    this.data.offset = 0
    await this.fetchVideo()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  },
  async fetchVideo() {
    const { data, hasMore } = await getVideo({ offset: this.data.offset, limit: 20 })
    this.setData({
      videoList: [...this.data.videoList, ...data]
    })
    // 不需要更新页面,因此不需要调用setData
    this.data.offset = this.data.videoList.length
    this.data.hasMore = hasMore as boolean
  },
})