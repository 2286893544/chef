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
              index: '6'
            },
            name: 'index',
            path: '/carousel/index'
          },
        ]
      }

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
