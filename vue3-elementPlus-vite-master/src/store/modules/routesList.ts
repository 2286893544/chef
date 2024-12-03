import { Module } from 'vuex';
import { RoutesListState, RootStateTypes } from 'store/interface/index';
import { AppRouteRecordRaw } from '../interface/index'
const routesListModule: Module<RoutesListState, RootStateTypes> = {
  namespaced: true,
  state: {
    routesList: [
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-menu',
          isAffix: true,
          isHide: false,
          isKeepAlive: true,
          title: '首页',
          index: '1'
        },
        name: 'home',
        path: '/home'
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: '活动管理',
          index: '2'
        },
        name: 'active',
        path: '/active',
        children: [
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-s-grid',
              isAffix: false,
              isHide: false,
              isKeepAlive: true,
              title: '活动信息',
              index: '2-1'
            },
            name: 'info',
            path: '/active/info'
          },
        ]
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: 'icon',
          index: '3'
        },
        name: 'icon',
        path: '/icon'
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: 'elementIcon',
          index: '4'
        },
        name: 'elementIcon',
        path: '/elementIcon'
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: '轮播图管理',
          index: '5'
        },
        name: 'carousel',
        path: '/carousel',
        children: [
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-s-grid',
              isAffix: false,
              isHide: false,
              isKeepAlive: true,
              title: '轮播图',
              index: '5-1'
            },
            name: 'index',
            path: '/carousel/index'
          },
        ]
      }
    ],
  },
  mutations: {
    // 设置路由，菜单中使用到
    getRoutesList(state: any, data: Array<AppRouteRecordRaw>) {
      state.routesList = data;
    },
  },
  actions: {
    // 设置路由，菜单中使用到
    async setRoutesList({ commit }, data: Array<AppRouteRecordRaw>) {
      commit('getRoutesList', data);
    },
  },
};

export default routesListModule;
