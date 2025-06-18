import type { ISong } from "../../services/modules/home/models/home.model"

// components/menu-item/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    song: {
      type: Object,
      value: {} as ISong
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
    onMenuItemTap() {
      const { id } = this.properties.song
      wx.navigateTo({
        url: `/pages/detail-songs/index?type=album&id=${id}`
      })
    }
  }
})