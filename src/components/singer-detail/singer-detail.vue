<template>
  <transition name="slide">
    <div class="singer-detail">
      子!
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import { getSingerDetail } from 'api/singer';
import { ERR_OK } from 'api/config';
import { createSong } from 'common/js/song';

export default {
  computed: {
    ...mapGetters(['singer'])
  },
  created() {
    console.log(this.singer);
    this._getDetail();
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer');
      }
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          console.log(res.data.list);
          this.songs = this._normalizeSongs(res.data.list);
          console.log(this.songs);
        }
      });
    },
    _normalizeSongs(songList) {
      const ret = [];
      songList.forEach(item => {
        const { musicData } = item;
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    }
  }
};
</script>

<style lang="scss">
@import 'common/scss/const.scss';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s ease;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}

</style>
