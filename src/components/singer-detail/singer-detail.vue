<template>
  <transition name="slide">
    <div class="singer-detail"></div>
  </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail, getSongVkey} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import {createSong} from '@/common/js/song'

export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'singer'
    ])
  },
  created () {
    this._getSingerDetail()
  },
  methods: {
    _getSingerDetail () {
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
          console.log(this.songs)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach(item => {
        let {musicData} = item
        getSongVkey(musicData.songmid).then(res => {
          let vkey = res.data.items[0].vkey
          if (musicData.songmid && musicData.albumid) {
            ret.push(createSong(musicData, vkey))
          }
        })
      })
      return ret
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import '~@/common/stylus/variable.styl'

  .singer-detail
    position fixed
    z-index 100
    top 0
    left 0
    bottom  0
    right 0
    background $color-background
  .slide-enter-active, .slide-leave-active
    transition all 0.3s
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
