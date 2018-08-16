<template>
  <div class="recommend" ref="recommend">
    <!-- 轮播图 -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <div v-for="item in recommends" :key="item.id">
              <a :href="item.linkUrl">
                <img class="needsclick" :src="item.picUrl" @load="imgLoaded" />
              </a>
            </div>
          </slider>
        </div>
        <!-- 歌单推荐 -->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discList" class="item" :key="item.dissid" @click="selectItem(item)">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.dissname"></h2>
                <p class="desc" v-html="item.creator.name"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 加载图 -->
      <div class="loading-container" v-show="!discList.length">
        <loading />
      </div>
    </scroll>
    <!-- 歌单 -->
    <router-view></router-view>

  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import Scroll from 'base/scroll/scroll';
import Slider from 'base/slider/slider';
import Loading from 'base/loading/loading';
import { getRecommend, getList } from 'api/recommend';
import { ERR_OK } from 'api/config';
import { playlistMixin } from 'common/js/mixin';

export default {
  components: {
    Slider,
    Scroll,
    Loading,
  },
  mixins: [
    playlistMixin
  ],
  data() {
    return {
      recommends: [],
      discList: [],
      checkLoaded: false,
    };
  },
  created() {
    this._getRecommend();
    this._getList();
  },
  methods: {
    ...mapMutations({
      setDisc: 'SET_DISC',
    }),
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          // console.log(res.data.slider);
          this.recommends = res.data.slider;
        }
      });
    },
    _getList() {
      getList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list;
          // console.log(this.discList);
        }
      });
    },
    imgLoaded() {
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh();
        this.checkLoaded = true;
      }
    },
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      });
      this.setDisc(item);
    },
    // mixins
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : '';
      this.$refs.recommend.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },
  },
};
</script>

<style lang=scss>
@import 'common/scss/const.scss';
@import 'common/scss/mymixin.scss';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slide-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }
      .item {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .desc {
            color: $color-text-d;
          }
        }
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
