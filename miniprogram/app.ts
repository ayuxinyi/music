// app.ts
App<IAppOption>({
  globalData: {
    screenWidth: 375,
    screenHeight: 667,
    statusBarHeight: 20,
    contentHeight: 603
  },
  onLaunch() {
    const { screenHeight, screenWidth, statusBarHeight } = wx.getWindowInfo()
    this.globalData.screenHeight = screenHeight
    this.globalData.screenWidth = screenWidth
    this.globalData.statusBarHeight = statusBarHeight
    this.globalData.contentHeight = screenHeight - statusBarHeight - 44
  }
})