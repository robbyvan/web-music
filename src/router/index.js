import Vue from 'vue';
import Router from 'vue-router';
import Recommend from 'components/recommend/recommend';
import Singer from 'components/singer/singer';
import Rank from 'components/rank/rank';
import Search from 'components/search/search';
import SingerDetail from 'components/singer-detail/singer-detail';
import Disc from 'components/disc/disc';
import RankDetail from 'components/rank-detail/rank-detail';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: Recommend
    },
    {
      path: '/recommend',
      name: 'Recommend',
      component: Recommend,
      children: [
        { path: ':id', component: Disc }
      ]
    },
    {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        { path: ':id', component: SingerDetail, name: 'SingerDetail' }
      ],
    },
    {
      path: '/rank',
      name: 'Rank',
      component: Rank,
      children: [
        { path: ':id', component: RankDetail, name: 'RankDetail' }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    }
  ]
});
