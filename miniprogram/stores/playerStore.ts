const { HYEventStore } = require("hy-event-store")

const playerStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0
  },
  actions: {}
})
// 通过playerStore.setData("playSongList",value) 设置state的值
// 通过playerStore.dispatch调用actions中的方法
// 通过playerStore.onState("playSongList",cb)监听state变化
// 通过playerStore.offState("playSongList",cb)取消监听
// 通过playerStore.onStates(["playSongList","playSongIndex"],cb)监听多个state变化
// 通过playerStore.offStates(["playSongList","playSongIndex"],cb)取消监听
export default playerStore