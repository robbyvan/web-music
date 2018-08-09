<template>
  <div id="app">
    <m-header />
    <tab />
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
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
