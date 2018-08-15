<template>
  <scroll
    class="suggest"
    ref="suggest"
    :data="result"
    :pullup="pullup"
    @scrollToEnd="searchMore"
    :beforeScroll="beforeScroll"
    @beforeScrollStart="listScroll"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" :key="item.id" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore"></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="什么都没找到啊  (。・＿・。)ﾉ" />
    </div>
  </scroll>
</template>

<script>
import { mapMutations, mapActions } from 'vuex';
import Scroll from 'base/scroll/scroll';
import Loading from 'base/loading/loading';
import NoResult from 'base/no-result/no-result';
import { search } from 'api/search';
import { ERR_OK } from 'api/config';
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song';
import Singer from 'common/js/singer';

const TYPE_SINGER = 'singer';
const RESULT_PER_PAGE = 20;

export default {
  components: {
    Scroll,
    Loading,
    NoResult,
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      isLoading: false,
      beforeScroll: true,
    };
  },
  props: {
    query: { type: String, default: '' },
    showSinger: { type: Boolean, default: true }
  },
  watch: {
    query() {
      if (this.query) {
        this.search();
      }
    }
  },
  methods: {
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    search() {
      if (this.isLoading) {
        return;
      }
      this.hasMore = true;
      this.isLoading = true;
      this.$refs.suggest.scrollTo(0, 0);
      search(this.query, this.page, this.showSinger, RESULT_PER_PAGE).then(res => {
        this.isLoading = false;
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result;
            this._checkMore(res.data);
          });
        }
      });
    },
    searchMore() {
      if (this.isLoading) {
        return;
      }
      // 拼接结果
      if (!this.hasMore) {
        return;
      }
      this.page++;
      this.isLoading = true;
      // console.log(this.page, 'page');
      search(this.query, this.page, this.showSinger, RESULT_PER_PAGE)
        .then(res => {
          this.isLoading = false;
          if (res.code === ERR_OK) {
            this._genResult(res.data).then((result) => {
              this.result = this.result.concat(result);
            });
            this._checkMore(res.data);
          }
        });
    },
    _checkMore(data) {
      const song = data.song;
      if (!song.list.length || (song.curnum + song.curpage * RESULT_PER_PAGE) > song.totalnum) {
        this.hasMore = false;
      }
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine';
      }
      return 'icon-music';
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      }
      return `${item.name}-${item.singer}`;
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername,
        });
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer);
      } else {
        this.insertSong(item);
      }
      this.$emit('select');
    },
    refresh() {
      this.$refs.suggest.refresh();
    },
    // 开始滚动
    listScroll() {
      this.$emit('listScroll');
    },
    _genResult(data) {
      let ret = [];
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs);
        return ret;
      });
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    },
  }
};
</script>

<style lang="scss">
@import 'common/scss/const.scss';
@import 'common/scss/mymixin.scss';

.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 30px;
    }
    .icon {
      flex: 0 0 30px;
      width: 30px;
      [class^="icon-"] {
        font-size: 14px;
        color: $color-text-d;
      }
    }
    .name {
      flex: 1;
      font-size: $font-size-medium-x;
      color: $color-text-d;
      overflow: hidden;
      .text {
        @include no-wrap();
      }
    }
  }
  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
