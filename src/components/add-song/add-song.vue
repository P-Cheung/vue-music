<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box @query="onQueryChange" placeholder="搜索歌曲" ref="searchbox"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll class="list-scroll"
                  v-if="currentIndex===0"
                  ref="songlist"
                  :data="playHistory"
          >
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectItem"></song-list>
            </div>
          </scroll>
          <scroll class="list-scroll"
                  v-if="currentIndex===1"
                  :data="searchHistory"
                  ref="searchlist"
          >
            <div class="list-inner">
              <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest"></suggest>
      </div>
      <top-list ref="toplist">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">添加1首歌曲到列表</span>
        </div>
      </top-list>
    </div>
  </transition>
</template>

<script>
import {searchMixin} from '@/common/js/mixin'
import Switches from '@/base/switches/switches'
import Scroll from '@/base/scroll/scroll'
import SongList from '@/base/song-list/song-list'
import SearchList from '@/base/search-list/search-list'
import {mapState, mapActions} from 'vuex'
import Song from '@/common/js/song'
import TopList from '@/base/top-list/top-list'

export default {
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      showSinger: false,
      switches: [
        {name: '最近播放'},
        {name: '搜索历史'}
      ],
      currentIndex: 0
    }
  },
  computed: {
    ...mapState([
      'playHistory'
    ])
  },
  components: {
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopList
  },
  methods: {
    show () {
      this.showFlag = true
      this.refreshList() // scroll初始化时，add-song组件display为none，高度计算不正确
    },
    refreshList () {
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songlist.refresh()
        } else {
          this.$refs.searchlist.refresh()
        }
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    switchItem (index) {
      this.currentIndex = index
    },
    selectItem (song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song)) // 需要将从storage里取出来的song实例化
        this.$refs.toplist.show()
      }
    },
    selectSuggest () {
      this.saveSearch()
      this.$refs.toplist.show()
    },
    ...mapActions([
      'savePlayHistory',
      'insertSong'
    ])
  },
  watch: {
    query (newVal) {
      if (!newVal) {
        this.refreshList()
      }
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
