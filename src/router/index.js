import Vue from 'vue';
import Router from 'vue-router';
// import Recommend from 'components/recommend/recommend';
// import Singer from 'components/singer/singer';
// import Rank from 'components/rank/rank';
// import Search from 'components/search/search';
// import SingerDetail from 'components/singer-detail/singer-detail';
// import Disc from 'components/disc/disc';
// import RankDetail from 'components/rank-detail/rank-detail';
// import UserCenter from 'components/user-center/user-center';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "recommend" */ 'components/recommend/recommend')
    },
    {
      path: '/recommend',
      name: 'Recommend',
      component: () => import(/* webpackChunkName: "recommend" */ 'components/recommend/recommend'),
      children: [
        { path: ':id', component: () => import(/* webpackChunkName: "disc" */ 'components/disc/disc') }
      ]
    },
    {
      path: '/singer',
      name: 'Singer',
      component: () => import(/* webpackChunkName: "singer" */ 'components/singer/singer'),
      children: [
        { path: ':id', component: () => import(/* webpackChunkName: "singer-detail" */ 'components/singer-detail/singer-detail') }
      ],
    },
    {
      path: '/rank',
      name: 'Rank',
      component: () => import(/* webpackChunkName: "rank" */ 'components/rank/rank'),
      children: [
        { path: ':id', component: () => import(/* webpackChunkName: "rank-detail" */ 'components/rank-detail/rank-detail') }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import(/* webpackChunkName: "search" */ 'components/search/search'),
      children: [
        { path: ':id', component: () => import(/* webpackChunkName: "singer-detail" */ 'components/singer-detail/singer-detail') }
      ],
    },
    {
      path: '/user',
      name: 'UserCenter',
      component: () => import(/* webpackChunkName: "user-center" */ 'components/user-center/user-center'),
    }
  ]
});
