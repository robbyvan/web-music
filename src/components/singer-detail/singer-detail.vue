<template>
  <transition name="slide">
    <div class="singer-detail">
      <music-list
        :songs="songs"
        :bg-image="bgImage"
        :title="title"
      />
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import MusicList from 'components/music-list/music-list';
import { getSingerDetail } from 'api/singer';
import { ERR_OK } from 'api/config';
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song';

export default {
  components: {
    MusicList,
  },
  data() {
    return {
      songs: [],
    };
  },
  computed: {
    ...mapGetters(['singer']),
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    }
  },
  created() {
    // console.log(this.singer);
    this._getDetail();
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer');
      }
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          // console.log(res.data.list);
          processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs;
            // console.log(this.songs);
          });
        }
      });
    },
    _normalizeSongs(songList) {
      const ret = [];
      songList.forEach((item) => {
        let {musicData} = item;
        if (isValidMusic(musicData)) {
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
