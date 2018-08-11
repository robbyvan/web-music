import { mapGetters } from 'vuex';

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
