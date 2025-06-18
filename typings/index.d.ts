/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    screenWidth: number,
    screenHeight: number,
    statusBarHeight: number,
    contentHeight: number
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

interface ResponseCommon {
  msg: string
  code: number
  [key: string]: any
}