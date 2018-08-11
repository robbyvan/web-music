<template>
  <div id="app">
    <m-header />
    <tab />
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player />
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header.vue';
import Tab from 'components/tab/tab';
import Player from 'components/player/player';

export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player
  }
};
</script>

<style lang="scss" scoped>
@import "common/scss/const.scss";

</style>
