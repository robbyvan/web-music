<template>
  <div id="app">
    <MHeader />
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header.vue';
export default {
  name: 'App',
  components: {
    MHeader
  }
};
</script>

<style lang="scss" scoped>
@import "common/scss/const.scss";

#app {
  color: $color-theme;
}
</style>
