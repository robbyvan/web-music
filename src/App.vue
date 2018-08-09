<template>
  <div id="app">
    <m-header />
    <tab />
    <router-view></router-view>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header.vue';
import Tab from 'components/tab/tab';
export default {
  name: 'App',
  components: {
    MHeader,
    Tab
  }
};
</script>

<style lang="scss" scoped>
@import "common/scss/const.scss";

</style>
