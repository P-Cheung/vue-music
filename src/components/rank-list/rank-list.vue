<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script>
import MusicList from '../music-list/music-list'
import {mapState} from 'vuex'
import {getCurrentToplist} from '@/api/rank'
import {getSongVkey} from '@/api/singer'
import {createSong} from '@/common/js/song'
import {ERR_OK} from '@/api/config'

export default {
  components: {
    MusicList
  },
  data () {
    return {
      songs: [],
      rank: true
    }
  },
  computed: {
    ...mapState([
      'currentToplist'
    ]),
    title () {
      return this.currentToplist.topTitle
    },
    bgImage () {
      // return this.currentToplist.picUrl
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    }
  },
  methods: {
    _getCurrentToplist () {
      if (!this.currentToplist.id) {
        this.$router.push('/rank')
        return
      }
      getCurrentToplist(this.currentToplist.id).then(res => {
        if (res.code === ERR_OK) {
          // let songlist = res.songlist.filter(item => { // 过滤付费歌曲
          //   return !item.data.pay.payplay
          // })
          this.songs = this._normalizeSongs(res.songlist)
          console.log(this.songs)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach(item => {
        let {data} = item
        getSongVkey(data.songmid).then(res => {
          let vkey = res.data.items[0].vkey
          if (data.songmid && data.albumid) {
            ret.push(createSong(data, vkey))
          }
        })
      })
      return ret
    }
  },
  created () {
    this._getCurrentToplist()
  }
}
</script>

<style lang='stylus' scoped>
.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
.slide-enter-active, .slide-leave-active
  transition: all 0.3s
</style>
