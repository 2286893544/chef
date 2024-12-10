<template>
  <div class="loading" v-if="props.loadState">
    <img src="@/assets/image/loading.png" alt="图片路径错误">
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// 接收父组件传递过来的数据
const props = defineProps({
  loadState: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped lang="less">
.loading {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);

  img {
    width: 50%;
  }
}
</style>
