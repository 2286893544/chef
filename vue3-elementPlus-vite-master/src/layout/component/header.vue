<template>
  <el-header class="layout-header" height="50">
    <NavBarsIndex />
  </el-header>
</template>

<script lang="ts">
  import { computed } from 'vue'
  import { useStore } from 'store/index'
  import NavBarsIndex from './navBars/index.vue'
  export default {
    name: 'layoutHeader',
    components: { NavBarsIndex },
    setup() {
      const store = useStore()
      // 设置 header 的高度
      // const setHeaderHeight = computed(() => {
      // 	let { isTagsview, layout } = store.state.themeConfig;
      // 	if (isTagsview && layout !== 'classic') return '84px';
      // 	else return '50px';
      // });
      return {
        // setHeaderHeight,
      }
    }
  }
</script>
