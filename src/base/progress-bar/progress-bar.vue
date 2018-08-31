<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
        @touchstart.prevent="progressTouchstart"
        @touchmove.prevent="progressTouchmove"
        @touchend="progressTouchend"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from '@/common/js/dom'

const transform = prefixStyle('transform')
const btnWidth = 16

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent (newVal) {
      if (newVal >= 0 && !this.touch.initiated) {
        const progressBarWidth = this.$refs.progressBar.clientWidth
        const offsetX = newVal * (progressBarWidth - btnWidth)
        this._offset(offsetX)
      }
    }
  },
  methods: {
    progressTouchstart (e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchmove (e) {
      if (!this.touch.initiated) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX
      const barWidth = this.$refs.progressBar.clientWidth - btnWidth
      const offsetX = Math.min(barWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetX)
    },
    progressTouchend () {
      this._triggerPercent()
      this.touch.initiated = false
    },
    progressClick (e) {
      this._offset(e.offsetX - btnWidth / 2)
      this._triggerPercent()
    },
    _offset (offsetX) {
      this.$refs.progress.style.width = offsetX + 'px'
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetX}px, 0, 0)`
    },
    _getPercent () {
      let barWidth = this.$refs.progressBar.clientWidth - btnWidth
      return this.$refs.progress.clientWidth / barWidth
    },
    _triggerPercent () {
      this.$emit('progressChange', this._getPercent())
    }
  },
  created () {
    this.touch = {}
  }
}
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
