<template>
  <div class="singer-wrapper" ref="singer">
    <list-view :data="singerlist" @select="selectSinger" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import {getSingerList} from '@/api/singer.js'
import {ERR_OK} from '@/api/config.js'
import Singer from '@/common/js/singer'
import ListView from '@/base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'

const HOT_NAME = '热门'
const HOT_LENGTH = 10

export default {
  mixins: [playlistMixin],
  name: 'Singer',
  components: {
    ListView
  },
  data () {
    return {
      singerlist: []
    }
  },
  mounted () {
    this._getSingerList()
  },
  methods: {
    handlePlaylist (playlist) {
      let bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer)
    },
    _getSingerList () {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singerlist = this._normalizeSinger(res.data.list)
        }
      })
    },
    _normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        if (index < HOT_LENGTH) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        let key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })

      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }

      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
}
</script>

<style lang='stylus' scoped>
.singer-wrapper
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
</style>
