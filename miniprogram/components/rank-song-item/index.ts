import songBehavior from "../../mixins/song"
// components/rank-song-item/index.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    index: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  behaviors: [songBehavior]
})