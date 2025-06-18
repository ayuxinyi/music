// components/nav-bar/index.ts
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },
  data: {
    statusHeight: 20
  },
  lifetimes: {
    created() {
      const app = getApp<IAppOption>()
      this.setData({ statusHeight: app.globalData.statusBarHeight })
    }
  },
  methods: {
    onBackTap() {
      wx.navigateBack()
    }
  }
})