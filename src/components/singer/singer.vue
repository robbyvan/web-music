<template>
  <div class="singer" ref="singerRef">
    <listview :data="singers"></listview>
  </div>
</template>

<script>
import { getSingerList } from 'api/singer';
import { ERR_OK } from 'api/config';
import { createSinger } from 'common/js/singer';
import Listview from 'base/listview/listview';

const HOT_NAME = '热门';
const HOT_SINGERS_LEN = 10;

export default {
  components: {
    Listview,
  },
  data() {
    return {
      singers: [],
    };
  },
  created() {
    this._getSingerList();
  },
  methods: {
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this.normalizeSinger(res.data.list);
          console.log(this.singers);
        }
      });
    },
    normalizeSinger(list) {
      let map = {
        hot: { title: HOT_NAME, items: [] },
      };
      list.forEach((item, index) => {
        if (index < HOT_SINGERS_LEN) {
          map.hot.items.push(createSinger(item));
        }
        const key = item.Findex;
        if (!map[key]) {
          map[key] = { title: key, items: [] };
        }
        map[key].items.push(createSinger(item));
      });

      const hot = [];
      const ret = [];

      for (let key in map) {
        let val = map[key];
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }

      ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0));

      return hot.concat(ret);
    }
  },
};
</script>

<style lang="scss" scoped>
@import 'common/scss/const.scss';
@import 'common/scss/mymixin.scss';

.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
