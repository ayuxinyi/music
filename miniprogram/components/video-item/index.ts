import type { IVideo } from "../../services/modules/video/models/video.model"
Component({
  properties: {
    video: {
      type: Object,
      value: {} as IVideo
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  methods: {
    onItemTap() {
      const id = this.properties.video.id
      wx.navigateTo({
        url: `/pages/detail-video/index?id=${id}`
      })
    }
  }
})