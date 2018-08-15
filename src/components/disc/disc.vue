<template>
  <transition name="slide">
      <music-list :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import MusicList from 'components/music-list/music-list';
import { getSongList } from 'api/recommend';
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
    ...mapGetters([
      'disc',
    ]),
    title() {
      return this.disc.dissname;
    },
    bgImage() {
      return this.disc.imgurl;
    }
  },
  created() {
    this._getSongList();
  },
  methods: {
    _getSongList() {
      if (!this.disc.dissid) {
        // 刷新情况的处理
        this.$router.push('/recommend');
        return;
      }
      getSongList(this.disc.dissid)
        .then(res => {
          if (res.code === ERR_OK) {
            // console.log(res);
            processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
              this.songs = songs;
              // console.log(this.songs);
            });
          }
        });
    },
    _normalizeSongs(list) {
      const ret = [];
      list.forEach((musicData) => {
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
  .slide-enter-active .slide-leave-active {
    transition: all 0.3s;
  }
  .slide-enter .slide-leave {
    transform: translate3d(100%, 0, 0);
  }
</style>
