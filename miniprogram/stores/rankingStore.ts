import { getPlayList } from "../services/modules/home/home.service"
import type { ListIdType } from "../services/modules/home/models/home.model"

const { HYEventStore } = require("hy-event-store")

export const rankingIdsMap: {
  newRanking: ListIdType
  originRanking: ListIdType
  upRanking: ListIdType
} = {
  newRanking: 3779629,
  originRanking: 2884035,
  upRanking: 19723756
}

const rankingStore = new HYEventStore({
  state: {
    // 新歌榜
    newRanking: {},
    // 原创榜
    originRanking: {},
    // 飙升榜
    upRanking: {}
  },
  actions: {
    async fetchRankingList(ctx: any) {
      for (const key in rankingIdsMap) {
        const id = rankingIdsMap[key as keyof typeof rankingIdsMap]
        getPlayList(id).then(res => {
          ctx[key] = res.playlist
        })
      }
    }
  }
})

export default rankingStore