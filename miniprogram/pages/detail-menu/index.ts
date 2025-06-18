import { getSongTags } from "../../services/modules/home/home.service";
import type { ISongResponse } from "../../services/modules/home/models/home.model";
import { getSongMenuList } from "../../services/modules/home/home.service"
// pages/detail-menu/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songMenus: <ISongResponse[]>[]
  },
  onLoad() {
    this.fetchAllTag()
  },
  async fetchAllTag() {
    const { tags } = await getSongTags()
    // 根据tags去获取对应的数据
    const tagPromise = tags!.map((res) => getSongMenuList(res.name))
    const res = await Promise.all(tagPromise)
    this.setData({ songMenus: res })
  }
})