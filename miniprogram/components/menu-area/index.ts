// components/menu-area/index.ts
const app = getApp<IAppOption>()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    title: {
      type: String,
      value: "默认标题"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    screenWidth: 375
  },
  lifetimes: {
    created() {
      this.setData({ screenWidth: app.globalData.screenWidth })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onMenuMoreClick() {
      wx.navigateTo({
        url: "/pages/detail-menu/index"
      })
    }
  }
})