import { getPlayList } from "../services/modules/home/home.service"
import type { IPlayList } from "../services/modules/home/models/home.model"

const { HYEventStore } = require("hy-event-store")

const recommendStore = new HYEventStore({
  state: {
    recommendSongsInfo: <IPlayList>{}
  },
  actions: {
    async fetchRecommendSongsAction(ctx: any) {
      const res = await getPlayList(3778678)
      ctx.recommendSongsInfo = res.playlist
    }
  }
})

export default recommendStore