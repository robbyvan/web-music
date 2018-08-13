import { mapGetters, mapMutations } from 'vuex';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/util';

// 处理有playlist时的scroll对于mini player的高度修正问题
export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(this.playlist);
    }
  },
  mounted() {
    this.handlePlaylist(this.playlist);
  },
  activated() {
    this.handlePlaylist(this.playlist);
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method.');
    }
  }
};

// 播放模式切换 在player和playlist中共享
export const playerMixin = {
  computed: {
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'mode'
    ]),
    iconMode() {
      return this.mode === playMode.sequence
        ? 'icon-sequence'
        : this.mode === playMode.loop
          ? 'icon-loop' : 'icon-random';
    },
  },
  methods: {
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
    }),
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlayList(list);
    },
    resetCurrentIndex(list) {
      const index = list.findIndex(item => item.id === this.currentSong.id);
      this.setCurrentIndex(index);
    },
  }
};
