<template>
  <scroll
    class="listview"
    ref="listview"
    :data="data"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <!-- 歌手列表 -->
    <ul>
      <li v-for="group in data" class="list-group" :key="group.title" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li
            v-for="item in group.items"
            class="list-group-item"
            :key="item.id"
            @click="selectItem(item)"
          >
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 字母导航 -->
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          class="item"
          :class="{ 'current': currentIndex === index }"
          :key="item"
          :data-index="index">
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 顶端fixed当前组别 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <!-- loading -->
    <div v-show="!data.length" class="loading-container">
      <loading />
    </div>
  </scroll>
</template>

<script>
import Loading from 'base/loading/loading';
import Scroll from 'base/scroll/scroll';
import { getData } from 'common/js/dom';

const ANCHOR_HEIGHT = 18;
const TITLE_HEIGHT = 30;

export default {
  components: {
    Scroll,
    Loading,
  },
  props: {
    data: { type: Array, default: () => [] },
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1,
    };
  },
  computed: {
    shortcutList() {
      return this.data.map(group => group.title.substr(0, 1));
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return '';
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
    }
  },
  created() {
    this.touch = {};
    this.listenScroll = true;
    this.listHeight = [];
    this.probeType = 3;
  },
  watch: {
    data() {
      // 数据变化 => DOM变化
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
    },
    scrollY(newY) {
      const listHeight = this.listHeight;
      // 确定落在哪个区间
      // 当滚动到顶部newY > 0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 滚动到中间
      for (let i = 0; i < listHeight.length - 1; ++i) {
        const lower = listHeight[i];
        const upper = listHeight[i + 1];
        // -newY: 是+值
        if (-newY >= lower && -newY < upper) {
          this.currentIndex = i;
          this.diff = upper + newY;
          return;
        }
        this.currentIndex = 0;
      }
      // 滚动到底部, 且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal) {
      const fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
      if (this.fixedTop === fixedTop) {
        return;
      }
      this.fixedTop = fixedTop;
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
    }
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item);
    },
    onShortcutTouchStart(e) {
      // console.log(e);
      const anchorIndex = getData(e.target, 'index');
      // 记录开始滑动时的位置
      const firstTouch = e.touches[0];
      this.touch.y1 = firstTouch.pageY;
      // 开始滑动时的index
      this.touch.anchorIndex = anchorIndex;
      // 滑动至index的li
      this._scrollTo(anchorIndex);
    },
    onShortcutTouchMove(e) {
      const firstTouch = e.touches[0];
      this.touch.y2 = firstTouch.pageY;
      const delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
      // 注意this.touch.anchorIndex是字符串
      const anchorIndex = Number(this.touch.anchorIndex) + delta;
      this._scrollTo(anchorIndex);
    },
    refresh() {
      this.$refs.listview.refresh();
    },
    scroll(pos) {
      this.scrollY = pos.y;
    },
    _scrollTo(index) {
      if (!index && index !== 0) {
        return;
      }
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }
      this.scrollY = -this.listHeight[index];
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
    },
    _calculateHeight() {
      this.listHeight = [];
      const list = this.$refs.listGroup;
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; ++i) {
        let item = list[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
    },
  }
};
</script>

<style lang="scss" scoped>
@import 'common/scss/const.scss';
@import 'common/scss/mymixin.scss';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;
  .list-group {
    padding-bottom: 30px;
    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }
  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;
    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;
      &.current {
        color: $color-theme;
      }
    }
  }
  .list-fixed {
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }
  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}

</style>
