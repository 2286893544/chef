import { Module } from 'vuex';
// 此处加上 `.ts` 后缀报错，具体原因不详
import { TagsViewRoutesState, RootStateTypes } from 'store/interface/index';
import type { AppRouteRecordRaw } from 'store/interface/index';

const tagsViewRoutesModule: Module<TagsViewRoutesState, RootStateTypes> = {
  namespaced: true,
  state: {
    tagsViewRoutes: [
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
            name: 'index',
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
        name: 'alluser',
        path: '/alluser',
        children: [
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-s-grid',
              isAffix: false,
              isHide: false,
              isKeepAlive: true,
              title: '普通用户',
              index: '4-1'
            },
            name: 'comnu',
            path: '/alluser/comnu'
          },
          {
            meta: {
              auth: ['admin', 'test'],
              icon: 'iconfont el-icon-menu',
              isAffix: true,
              isHide: false,
              isKeepAlive: true,
              title: '选手管理',
              index: '4-2'
            },
            name: 'athlete',
            path: '/alluser/athlete'
          },
        ]
      },
      // 轮播图管理
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
    // 设置 TagsView 路由
    getTagsViewRoutes(state: any, data: Array<AppRouteRecordRaw>) {
      state.tagsViewRoutes = data;
    },
  },
  actions: {
    // 设置 TagsView 路由
    async setTagsViewRoutes({ commit }, data: Array<AppRouteRecordRaw>) {
      commit('getTagsViewRoutes', data);
    },
  },
};

export default tagsViewRoutesModule;
