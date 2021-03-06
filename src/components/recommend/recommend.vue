<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="disclist">
      <div>
        <div class="slider-wrapper" v-if="recommends.length">
          <div class="slider-content">
            <slider>
              <div v-for="item in recommends" :key="item.id">
                <a :href="item.linkUrl">
                  <img @load="loadImage" :src="item.picUrl">
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in disclist"
                :key="item.dissid"
                class="item"
                @click="selectDisc(item)"
            >
              <div class="icon">
                <img v-lazy="item.imgurl" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name">{{item.creator.name}}</h2>
                <p class="desc">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!disclist.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import {getRecommend, getDiscList} from '@/api/recommend'
import {ERR_OK} from '@/api/config'
import Slider from '@/base/slider/slider'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import {playlistMixin} from '@/common/js/mixin'
import {mapMutations} from 'vuex'

export default {
  mixins: [playlistMixin],
  name: 'Recommend',
  data () {
    return {
      recommends: [],
      disclist: []
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  },
  created () {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    ...mapMutations({
      setDisc: 'SET_DISC'
    }),
    handlePlaylist (playlist) {
      let bottom = playlist.length > 0 ? '60px' : 0
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    selectDisc (item) {
      this.$router.push({path: `/recommend/${item.dissid}`})
      this.setDisc(item)
    },
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.disclist = res.data.list
        }
      })
    },
    loadImage () {
      if (!this.checkloaded) { // 保证只执行一次
        this.$refs.scroll.refresh()
        this.checkloaded = true
      }
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import "~@/common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
        height: 0
        padding-top: 40%
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
