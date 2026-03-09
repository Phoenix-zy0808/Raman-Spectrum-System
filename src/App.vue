<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 导入全局样式
import '@/styles/element-theme.scss'
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app {
  @include fill-container;
  background-color: $bg-dark;
  overflow: hidden;
}
</style>