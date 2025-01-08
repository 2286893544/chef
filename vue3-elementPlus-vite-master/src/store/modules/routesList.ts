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
      // 活动管理
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
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-menu',
              isAffix: true,
              isHide: false,
              isKeepAlive: true,
              title: '活动说明',
              index: '2-2'
            },
            name: 'acspk',
            path: '/active/acspk'
          },
        ]
      },
      // 职位管理
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: '职位管理',
          index: '3'
        },
        name: 'position',
        path: '/position',
        children: [
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-s-grid',
              isAffix: false,
              isHide: false,
              isKeepAlive: true,
              title: '职位',
              index: '3-1'
            },
            name: 'positionIdx',
            path: '/position/positionIdx'
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
          title: '用户管理',
          index: '4'
        },
        name: 'athlete',
        path: '/athlete'
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
            name: 'carouseldx',
            path: '/carousel/carouseldx'
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
          title: '投票记录',
          index: '6'
        },
        name: 'votehistory',
        path: '/votehistory'
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: '礼物记录',
          index: '7'
        },
        name: 'present',
        path: '/present'
      },
      {
        meta: {
          auth: ['admin', 'test'],
          icon: 'iconfont el-icon-s-grid',
          isAffix: false,
          isHide: false,
          isKeepAlive: true,
          title: '简历审核',
          index: '8'
        },
        name: 'audit',
        path: '/audit'
      },
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
