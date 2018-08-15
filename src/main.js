import 'babel-polyfill';
import 'common/js/hack';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import fastclick from 'fastclick';
import VueLazyLoad from 'vue-lazyload';

/* eslint-disable no-unused-vars */
// import VConsole from 'vconsole';

import 'common/scss/index.scss';

// const vConsole = new VConsole();

// hack for global nextTick
fastclick.attach(document.body);

Vue.use(VueLazyLoad, {
  loading: require('common/img/lazy.png')
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
