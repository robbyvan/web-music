<template>
  <div class="player" v-show="playlist.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <!-- 全屏播放器 -->
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.img" />
        </div>

        <!-- 页面顶部 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>

        <!-- 页面中部 -->
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!-- 专辑封面 -->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls" ref="imageWrapper">
                <img :src="currentSong.img" class="image" ref="image" />
              </div>
            </div>
            <!-- 当前歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>

          <!-- 歌词页 -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   v-for="(line, index) in currentLyric.lines"
                   :class="{'current': currentLineNum === index}"
                   class="text"
                   :key="line.time">{{ line.txt }}</p>
              </div>
              <!-- 纯音乐 无歌词 -->
              <div class="pure-music" v-show="isPureMusic">
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </scroll>
        </div>

        <div class="bottom">
          <!-- 专辑封面&歌词页 切换dots -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd' }"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric' }"></span>
          </div>

          <!-- 播放进度条 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
                <progress-bar
                  :percent="percent"
                  @percentChange="onProgressBarChange"
                />
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>

          <!-- 播放按钮 -->
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i
                class="icon"
                :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 最小化播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imageWrapper" ref="miniWrapper">
            <img ref="miniImage" :src="currentSong.img" width="40" height="40" :class="cdCls"/>
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>

        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>

        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <!-- 播放列表 -->
    <playlist ref="playlist" />

    <!-- 实际播放器 -->
    <audio
      ref="audio"
      @playing="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      @pause="paused"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import animations from 'create-keyframe-animation';
import { prefixStyle } from 'common/js/dom';
import ProgressBar from 'base/progress-bar/progress-bar';
import ProgressCircle from 'base/progress-circle/progress-circle';
import Scroll from 'base/scroll/scroll';
import { playMode } from 'common/js/config';
// import { shuffle } from 'common/js/util';
import Lyric from 'lyric-parser';
import Playlist from 'components/playlist/playlist';
import { playerMixin } from 'common/js/mixin';

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');

const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g;

export default {
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist,
  },
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: '',
      isPureMusic: false,
      pureMusicLyric: ''
    };
  },
  computed: {
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex',
    ]),
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play';
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
    },
    cdCls() {
      return this.playing ? 'play' : 'play pause';
    },
    disableCls() {
      return this.songReady ? '' : 'disable';
    },
    // 进度条
    percent() {
      return this.currentTime / this.currentSong.duration;
    },
    //
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 删除了, 没有歌 || 歌没变化
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return;
      }
      // console.log('changed!', newSong, oldSong);
      // 歌曲发生变化, 重置初始状态
      this.songReady = false;
      this.canLyricPlay = false;
      // 切歌时清除上一首歌的歌词计时器
      if (this.currentLyric) {
        this.currentLyric.stop();
        // 重置歌词相关
        this.currentLyric = null;
        this.currentTime = 0;
        this.playingLyric = 0;
        this.currentLineNum = 0;
      }
      // console.log('写src之前:');
      // console.log(this.$refs.audio.src);
      // 动态写audio的src并播放
      this.$refs.audio.src = newSong.url;
      // console.log('写src之后:');
      // console.log(this.$refs.audio.src);
      this.$refs.audio.play();
      // console.log('播放');

      // 如果5s没有加载到歌曲, 认为超时(若没超时, 在ready里会清除掉这个timer), 修正songReady保证可以切歌.
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.songReady = true;
      }, 5000);
      // 异步获取歌词
      this.getLyric();

      // // 需要在dom ready之后才能play.
      // // setTimeout? 保证手机后台切换回来时js能正常执行, 使songReady正常,歌曲能成功播放
      // clearTimeout(this.timer); // 加一个timer 保证只执行一次下面的代码
      // this.timer = setTimeout(() => {
      //   // 要处理下面两个函数的关联问题: 在getLyric()中添加判断.
      //   this.$refs.audio.play(); // 立刻播放
      //   this.getLyric(); // 是异步, 要先去获取歌词
      // }, 1000);
    },
    playing(shouldPlay) {
      if (!this.songReady) {
        return;
      }
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        shouldPlay ? audio.play() : audio.pause();
      });
      // 暂停时封面旋转动画停止
      if (!shouldPlay) {
        if (this.fullScreen) {
          this.syncWrapperTransform('imageWrapper', 'image');
        } else {
          this.syncWrapperTransform('miniWrapper', 'miniImage');
        }
      }
    }
  },
  created() {
    this.touch = {};
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
    }),
    ...mapActions(['savePlayHistory']),
    // 播放器
    togglePlaying() {
      if (!this.songReady) {
        return;
      }
      this.setPlayingState(!this.playing);
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    ready() {
      // 加载完毕了, 清空掉设置的timer
      // console.log('i\'m playing!');
      clearTimeout(this.timer);
      // 准备完成
      this.songReady = true;
      this.canLyricPlay = true;

      this.savePlayHistory(this.currentSong);
      // 如果歌曲播放更晚, 同步歌词
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000);
      }
    },
    paused() {
      this.setPlayingState(false);
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    error() {
      this.songReady = true;
    },
    next() {
      if (!this.songReady) {
        return;
      }
      // 边界情况: 只有一首歌, 调用next = loop
      if (this.playlist.length === 1) {
        this.loop();
        return;
      } else {
        let index = this.currentIndex + 1;
        if (index === this.playlist.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    prev() {
      if (!this.songReady) {
        return;
      }
      // 边界情况: 只有一首歌, 调用next = loop
      if (this.playlist.length === 1) {
        this.loop();
        return;
      } else {
        let index = this.currentIndex - 1;
        if (index === -1) {
          index = this.playlist.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      this.setPlayingState(true);
      if (this.currentLyric) {
        this.currentLyric.seek(0);
      }
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime;
    },
    getLyric() {
      this.currentSong.getLyric()
        .then(lyric => {
          if (this.currentSong.lyric !== lyric) {
            // 如果切歌了, 直接返回
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          // 纯音乐 无歌词
          this.isPureMusic = !this.currentLyric.lines.length;
          if (this.isPureMusic) {
            this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim();
            this.playingLyric = this.pureMusicLyric;
          } else {
            // 有歌词
            if (this.playing && this.canLyricPlay) {
              // 同步歌词到歌曲时间
              this.currentLyric.seek(this.currentTime * 1000);
            }
          }
        })
        .catch(() => {
          // 异常处理
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0;
        });
    },
    handleLyric({ lineNum, txt }) {
      this.currentLineNum = lineNum;
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      this.playingLyric = txt;
    },
    middleTouchStart(e) {
      this.touch.initiated = true;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY; // Y轴? 歌词是Y移动, 判断当前是滑动歌词还是切屏
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 滑动歌词的时候X不能移动
        return;
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(Math.max(-window.innerWidth, left + deltaX), 0);
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    middleTouchEnd() {
      this.touch.initiated = false;
      let offsetWidth;
      let opacity;
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          opacity = 1;
          this.currentShow = 'cd';
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      const animTime = 300;
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = `${animTime}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${animTime}ms`;
    },
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      if (!this.playing) {
        this.togglePlaying();
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    // 播放列表
    showPlaylist() {
      this.$refs.playlist.show();
    },
    // UI
    back() {
      this.setFullScreen(false);
    },
    open() {
      this.setFullScreen(true);
    },
    // 动画相关
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      const animation = {
        0: { transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})` },
        60: { transform: `translate3d(0, 0, 0) scale(1.1)` },
        100: { transform: `translate3d(0, 0, 0) scale(1)` },
      };
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: { duration: 400, easing: 'linear', delay: 100 },
      });
      animations.runAnimation(this.$refs.cdWrapper, 'move', done);
    },
    afterEnter() {
      animations.unregisterAnimation('move');
      this.$refs.cdWrapper.style.animation = '';
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s';
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      this.$refs.cdWrapper.addEventListener('transitionend', done);
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = '';
      this.$refs.cdWrapper.style[transform] = '';
    },
    // 暂停时封面旋转动画停止
    syncWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return;
      }
      // let imageWrapper = this.$refs[wrapper];
      let image = this.$refs[inner];
      // let wTransform = getComputedStyle(imageWrapper)[transform];
      let iTransform = getComputedStyle(image)[transform];
      // imageWrapper.style[transform] = (wTransform === 'none')
      //   ? iTransform
      //   : wTransform;
      image.style[transform] = iTransform;
    },
    _getPosAndScale() {
      const targetWidth = 40; // 小图标宽度40
      const paddingLeft = 40; // 中心距左边界40
      const paddingBottom = 30; // 中心对底部30
      const paddingTop = 80; // 容器到顶部80
      const width = window.innerWidth * 0.8; // cd容器宽度
      const scale = targetWidth / width; // 初始缩放比例
      const x = -(window.innerWidth / 2 - paddingLeft); // 两中心x偏移
      // 总高 - 顶部 - 半径 - 小图标偏移
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return { x, y, scale };
    },
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = `0${num}`;
        len++;
      }
      return num;
    },
    format(interval) {
      interval = interval | 0; // Math.floor
      const minute = this._pad(interval / 60 | 0);
      const sec = this._pad(interval % 60);
      return `${minute}:${sec}`;
    }
  }
};
</script>

<style lang="scss">
@import 'common/scss/const.scss';
@import 'common/scss/mymixin.scss';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            &.play {
              animation: rotate 20s linear infinite;
            }
            &.pause {
              animation-play-state: paused;
              -webkit-animation-play-state:paused;
            }
            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            // width: 20px;
            // border-radius: 5px;
            background: $color-theme;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;
          &.time-l {
            text-align: left;
            margin-right: 5px;
          }
          &.time-r {
            text-align: right;
            margin-left: 5px;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;
      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    &.normal-enter, &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }
    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }
    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;
      img {
        border-radius: 50%;
        &.play {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        margin-bottom: 2px;
        @include no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }
      .desc {
        @include no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
