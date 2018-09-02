<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from '../music-list/music-list'
import {mapState} from 'vuex'
import {getSonglist} from '@/api/recommend'
import {ERR_OK} from '@/api/config'
import {createSong} from '@/common/js/song'
import {getSongVkey} from '@/api/singer'

export default {
  components: {
    MusicList
  },
  data () {
    return {
      songs: []
    }
  },
  computed: {
    ...mapState([
      'disc'
    ]),
    title () {
      return this.disc.dissname
    },
    bgImage () {
      return this.disc.imgurl
    }
  },
  methods: {
    _getSonglist () {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSonglist(this.disc.dissid).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.cdlist[0].songlist)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach(item => {
        getSongVkey(item.songmid).then(res => {
          let vkey = res.data.items[0].vkey
          if (item.albumid && item.songmid) {
            ret.push(createSong(item, vkey))
          }
        })
      })
      return ret
    }
  },
  created () {
    this._getSonglist()
  }
}
</script>

<style lang='stylus' scoped>
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
.slide-enter-active, .slide-leave-active
  transition all 0.3s
</style>
