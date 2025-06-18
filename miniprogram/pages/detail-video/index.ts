import type { IMvInfo } from "../../services/modules/video/models/video.model"
import { getMvInfo, getVideoUrl, getMvRelates } from "../../services/modules/video/video.service"

interface IData {
  id: number
  url: string,
  mvInfo: IMvInfo
  relatedMv: any[]
}

// pages/detail-video/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: <IData>{
    id: 0,
    url: '',
    mvInfo: {},
    relatedMv: [{
      vid: 1,
      title: "Deadman",
      coverUrl: "http://p1.music.126.net/SzN7QFUgDLZ0ybBoJNytOQ==/109951171118056735.jpg",
      playCount: 4786161,
      creator: [{
        userName: "周深"
      }]
    },
    {
      vid: 2,
      title: "I THINK I FELL IN ＜3",
      coverUrl: "http://p1.music.126.net/-GrckbOLv2m-fa9iKkuO6w==/109951171259543751.jpg",
      playCount: 646465,
      creator: [{
        userName: "腾格尔"
      }]
    },
    {
      vid: 3,
      title: "别忘记查收关心！",
      coverUrl: "http://p1.music.126.net/MNCE5nXmbSH7CqZWqGvoHg==/109951171288438074.jpg",
      playCount: 1504648,
      creator: [{
        userName: "张靓颖"
      }]
    },
    {
      vid: 5,
      title: "梦见你",
      coverUrl: "http://p1.music.126.net/QSAPyPhdz9OIzhTc2zjM0g==/109951171027583317.jpg",
      playCount: 79946446,
      creator: [{
        userName: "周杰伦"
      }]
    },
    {
      vid: 4,
      title: "「八城二十四」纪录片-上集",
      coverUrl: "http://p1.music.126.net/SEpTffP-KY2BFFVX4XEwNQ==/109951171296004197.jpg",
      playCount: 454646,
      creator: [{
        userName: "潘玮柏"
      }]
    },]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query: { id?: number }) {
    this.data.id = query.id as number
    this.fetchVideoUrl()
    this.fetchMvInfo()
    this.fetchAllRelates()
  },
  async fetchVideoUrl() {
    const res = await getVideoUrl(this.data.id)
    this.setData({ url: res.data.url })
  },
  async fetchMvInfo() {
    const res = await getMvInfo(this.data.id)
    this.setData({ mvInfo: res })
  },
  async fetchAllRelates() {
    await getMvRelates(this.data.id)
  }
})