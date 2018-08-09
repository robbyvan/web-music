<!-- loading 组件 -->

<template>
  <div class="loading">
    <img src="./loading.gif" height="24" width="24">
    <p class="desc">{{ title }}</p>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {}
  },
  props: {
    title: {
      type: String,
      default: '正在读取中...⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄'
    }
  },
  watch: {},
  methods: {},
  created () {},
  mounted () {},
  destroyed () {}
}
</script>

<style lang="scss" scoped>
@import 'common/scss/const.scss';

.loading {
  width: 100%;
  text-align: center;
  .desc {
    line-height: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
  }
}
</style>
