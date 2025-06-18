import type { ISong } from "../services/modules/home/models/home.model";

const songBehavior = Behavior({
  properties: {
    song: {
      type: Object,
      value: {} as ISong
    }
  },
  methods: {
    onSongPlay() {
      const { id } = this.properties.song
      wx.navigateTo({
        url: `/pages/music-player/index?id=${id}`
      })
    }
  }
})

export default songBehavior