<template>
  <scroll class="suggest"
          :data="result"
          @scrollToEnd="searchMore"
          :pullup="true"
          ref="suggest"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item, index) in result" :key="index" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-text="getText(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import {search} from '@/api/search'
import {ERR_OK} from '@/api/config'
import {createSong, processSongsUrl} from '@/common/js/song'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import Singer from '@/common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from '@/base/no-result/no-result'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  data () {
    return {
      page: 1,
      result: [],
      hasMore: true
    }
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    refresh () {
      this.$refs.suggest.refresh()
    },
    getIconCls (item) {
      if (item.type && item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getText (item) {
      if (item.type && item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    searchMore () {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data))
          this._checkMore(res.data.song)
        }
      })
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        let singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    _checkMore (song) {
      let num = song.curnum + (song.curpage - 1) * PER_PAGE
      if (!song.list.length || num >= song.totalnum) {
        this.hasMore = false
      }
    },
    _search () {
      this.page = 1
      this.$refs.suggest.scrollTo(0, 0) // 每次query改变时，重置page以及scroll位置
      this.hasMore = true
      search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
        if (ERR_OK === res.code) {
          this.result = this._genResult(res.data)
          // console.log(this.result)
          this._checkMore(res.data.song)
        }
      })
    },
    _genResult (data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      if (data.song) {
        ret = ret.concat(processSongsUrl(this._normalizeSongs(data.song.list)))
      }
      return ret
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach(item => {
        if (item.songmid && item.albumid) {
          ret.push(createSong(item))
        }
      })
      return ret
    }
  },
  watch: {
    query () {
      this._search()
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
        .icon
          flex: 0 0 30px
          width: 30px
          [class^="icon-"]
            font-size: 14px
            color: $color-text-d
        .name
          flex: 1
          font-size: $font-size-medium
          color: $color-text-d
          overflow: hidden
          .text
            no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
