<template>
  <div class="progress-circle">
    <svg :height="radius" :width="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" cx="50" cy="50" r="50" fill="transparent"></circle>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
      >
      </circle>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dashArray: Math.PI * 100
    }
  },
  props: {
    radius: {
      type: Number,
      default: 100
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  computed: {
    dashOffset () { // dasharray向前的偏移量（不可见）
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>

<style lang='stylus' scoped>
  @import "~@/common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
