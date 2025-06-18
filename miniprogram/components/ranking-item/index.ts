// components/ranking-item/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    rank: {
      type: Object,
      value: {}
    },
    key: {
      type: String,
      value: "newRanking"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onRankingTap() {
      const key = this.properties.key
      wx.navigateTo({
        url: `/pages/detail-songs/index?type=ranking&key=${key}`
      })
    }
  }
})