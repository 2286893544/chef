<template>
  <div class="layout-logo" v-if="setShowLogo" @click="onThemeConfigChange">
    <span>后台管理系统</span>
  </div>
</template>

<script lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useStore } from 'store/index'
export default {
  name: 'layoutLogo',
  setup() {
    const { proxy } = getCurrentInstance() as any
    const store = useStore()
    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig
    })
    // 设置显示/隐藏 logo
    const setShowLogo = computed(() => {
      let { layout, isShowLogo } = store.state.themeConfig
      return (
        (isShowLogo && layout === 'defaults') ||
        (isShowLogo && layout === 'columns')
      )
    })
    // logo 点击实现菜单展开/收起
    const onThemeConfigChange = () => {
      if (store.state.themeConfig.layout === 'transverse') return false
      // proxy.mittBus.emit('onMenuClick');
      store.state.themeConfig.isCollapse = !store.state.themeConfig.isCollapse
    }
    return {
      getThemeConfig,
      setShowLogo,
      onThemeConfigChange
    }
  }
}
</script>

<style scoped lang="scss">
.layout-logo {
  width: 220px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: rgb(0 21 41 / 2%) 0px 1px 4px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  animation: logoAnimation 0.3s ease-in-out;

  &:hover {
    span {
      color: var(--color-primary-light-2);
    }
  }

  &-medium-img {
    width: 20px;
    margin-right: 5px;
  }
}

.layout-logo-size {
  width: 100%;
  height: 50px;
  display: flex;
  cursor: pointer;
  animation: logoAnimation 0.3s ease-in-out;

  &-img {
    width: 20px;
    margin: auto;
  }

  &:hover {
    img {
      animation: logoAnimation 0.3s ease-in-out;
    }
  }
}
</style>
