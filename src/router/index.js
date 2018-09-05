import Vue from 'vue'
import Router from 'vue-router'
import Rank from '../components/rank/rank'
import Singer from '../components/singer/singer'
import Recommend from '../components/recommend/recommend'
import Search from '../components/search/search'
import SingerDetail from '../components/singer-detail/singer-detail'
import Disc from '@/components/disc/disc'
import RankList from '@/components/rank-list/rank-list'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: RankList
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    }
  ]
})
