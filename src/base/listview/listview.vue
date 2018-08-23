<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="this.listenScroll"
    @scroll="scroll"
    :probeType="this.probeType"
  >
    <ul>
      <li class="list-group" v-for="(group, index) in data" :key="index" ref="listgroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li
            v-for="(item, index) in group.items"
            :key="index"
            class="list-group-item"
            @click="selectItem(item)"
          >
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul>
        <li
          class="item"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          @touchstart.stop.prevent="onShortcutTouchStart"
          :class="{current: currentIndex === index}"
          @touchmove.stop.prevent="onShortcutTouchMove"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from '../scroll/scroll'
import {getData} from '@/common/js/dom'
import Loading from '@/base/loading/loading'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
  created () {
    this.touch = {}
    this.listHeight = []
    this.probeType = 3
    this.listenScroll = true
  },
  components: {
    Scroll,
    Loading
  },
  data () {
    return {
      currentIndex: 0,
      scrollY: 0,
      diff: 0
    }
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    }
  },
  computed: {
    shortcutList () {
      return this.data.map(item => {
        return item.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    selectItem (item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart (e) {
      let anchorIndex = parseInt(getData(e.target, 'index'))
      this.touch.y1 = e.touches[0].pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) {
      this.touch.y2 = e.touches[0].pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = this.touch.anchorIndex + delta
      this._scrollTo(anchorIndex)
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo (index) {
      this.$refs.listview.scrollToElement(this.$refs.listgroup[index], 0)
      index = index < 0 ? 0 : (index > this.shortcutList.length - 1 ? this.shortcutList.length - 1 : index)
      this.currentIndex = index
    },
    _caculateHeight () {
      this.listHeight = []
      let height = 0
      this.listHeight.push(height)
      const list = this.$refs.listgroup
      for (let i = 0; i < list.length; i++) {
        height += list[i].clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this._caculateHeight()
      }, 20)
    },
    scrollY (newY) {
      const listHeight = this.listHeight
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
        }
      }
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (fixedTop === this.fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translateY(${fixedTop}px)`
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
