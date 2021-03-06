<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
      @enter="enter"
      @afterEnter="afterEnter"
      @leave="leave"
      @afterLeave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{currentSong.name}}</h1>
          <h2 class="subtitle">{{currentSong.singer}}</h2>
        </div>
        <div class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img class="image" :class="cdCls" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyriclist" :data="currentLyric&&currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text"
                  :class="{current:index === currentLine}"
                  ref="lyricLine"
                  v-for="(item, index) in currentLyric.lines"
                  :key="index"
                >
                {{item.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <div class="dot" :class="{active:currentShow === 'cd'}"></div>
            <div class="dot" :class="{active:currentShow === 'lyric'}"></div>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
                @progressChange="onProgressChange"
              >
              </progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" @click="prev" :class="disableCls">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center" @click="togglePlaying" :class="disableCls">
              <i :class="playIcon"></i>
            </div>
            <div class="icon i-right" @click="next" :class="disableCls">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right" @click="toggleFavorite(currentSong)">
              <i class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
        </div>
        <div class="text">
          <h2 class="name">{{currentSong.name}}</h2>
          <p class="desc">{{currentSong.singer}}</p>
        </div>
        <div class="control" @click.stop="togglePlaying">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="show">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio
      :src="currentSong.url"
      ref="audio"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    >
    </audio>
  </div>
</template>

<script>
import {mapState, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '@/common/js/dom'
import ProgressBar from '@/base/progress-bar/progress-bar'
import ProgressCircle from '@/base/progress-circle/progress-circle'
import {playMode} from '@/common/js/config'
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll/scroll'
import Playlist from '../playlist/playlist'
import {playerMixin} from '@/common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLine: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  computed: {
    ...mapState([
      'fullScreen',
      'playing',
      'currentIndex'
    ]),
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    }
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULLSCREEN'
    }),
    ...mapActions([
      'savePlayHistory'
    ]),
    show () {
      this.$refs.playlist.show()
    },
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()

      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(${1.1})`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(${1})`
        }
      }

      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style.transition = 'all .4s'
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      let timer = setTimeout(done, 400)
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      this.setPlayingState(!this.playing)
    },
    next () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) { // 单曲循环且只有一首歌时
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      }
    },
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false
      }
    },
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error () {
      this.songReady = true
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    end () {
      if (playMode.loop === this.mode) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    format (time) {
      time = time | 0
      let min = time / 60 | 0
      let sec = this._pad(time % 60)
      return `${min}:${sec}`
    },
    onProgressChange (percent) {
      let currentTime = percent * this.currentSong.duration
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    getLyric () { // 获取并解析歌词
      this.currentSong.getLyric().then(res => {
        this.currentLyric = new Lyric(res, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => { // 获取歌词失败的边界情况
        this.currentLyric = null
        this.currentLine = 0
        this.playingLyric = ''
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLine = lineNum
      if (lineNum > 5) {
        let el = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyriclist.scrollToElement(el, 1000)
      } else {
        this.$refs.lyriclist.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      let touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      let touch = e.touches[0]
      let deltaX = touch.pageX - this.touch.startX
      let deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaX) < Math.abs(deltaY)) { // 取绝对值
        return
      }
      let left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 已经偏移的量
      let offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) // 当前偏移量，范围在-window.innerWidth和0之间
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
      this.$refs.lyriclist.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyriclist.$el.style[transitionDuration] = 0
    },
    middleTouchEnd () {
      let percent = this.touch.percent
      let time = 300
      let opacity
      let offsetWidth
      if (this.currentShow === 'cd') {
        if (percent > 0.1) {
          opacity = 0
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
        } else {
          opacity = 1
          offsetWidth = 0
        }
      } else {
        if (percent < 0.9) {
          opacity = 1
          offsetWidth = 0
          this.currentShow = 'cd'
        } else {
          opacity = 0
          offsetWidth = -window.innerWidth
        }
      }
      this.$refs.lyriclist.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyriclist.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.touch.initiated = false
    },
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    _getPosAndScale () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingTop = 80
      const paddingBottom = 30
      const width = window.innerWidth * 0.8

      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

      return {x, y, scale}
    }
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (!newSong.id) {
        return
      }
      if (newSong === oldSong) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      setTimeout(() => { // 保证后台切回前台的情况下正常播放
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing (newValue) {
      let audio = this.$refs.audio
      this.$nextTick(() => {
        newValue ? audio.play() : audio.pause()
      })
    }
  },
  created () {
    this.touch = {}
  }
}
</script>

<style lang='stylus' scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
              .pause
                animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
