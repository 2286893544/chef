<template>
  <template v-for="val in chils">
    <el-submenu
      :index="val.path"
      :key="val.path"
      v-if="val.children && val.children.length > 0"
    >
      <template #title>
        <i :class="val.meta.icon"></i>
        <span>{{ val.meta.title }}</span>
      </template>
      <sub-item :chil="val.children" />
    </el-submenu>
    <el-menu-item :index="val.path" :key="val.path" v-else>
      <template
        v-if="!val.meta.isLink"
      >
        <i :class="val.meta.icon ? val.meta.icon : ''"></i>
        <span>{{ val.meta.title }}</span>
      </template>
      <template v-else>
        <a :href="val.meta.isLink" target="_blank">
          <i :class="val.meta.icon ? val.meta.icon : ''"></i>
          {{ val.meta.title }}
        </a>
      </template>
    </el-menu-item>
  </template>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import type { Menu } from 'store/interface/index';
  import { computed, defineComponent } from 'vue'
  export default defineComponent({
    name: 'navMenuSubItem',
    props: {
      chil: {
        type: Array as PropType<Menu[]>,
        default: () => []
      }
    },
    setup(props) {
      // 获取父级菜单数据
      const chils = computed(() => {
        return props.chil
      })

      return {
        chils
      }
    }
  })
</script>
