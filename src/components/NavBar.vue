<template>
  <div class="header-section">
    <div class="header-bg">
      <div class="header-title">
        <span class="title-text">多模态拉曼光谱云端智能分析软件</span>
        <dv-decoration-6 class="dv-dec-6" :reverse="true" :color="['#50e3c2', '#67a1e5']" />
      </div>

      <div class="nav-btn-group">
        <div
          v-for="(item, index) in menuList"
          :key="index"
          class="nav-btn"
          :class="{ active: currentPath === item.path }"
          @click="gotoPage(item.path)"
        >
          <span class="react-before"></span>
          <span class="text">{{ item.name }}</span>
          <span class="react-after"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 自动获取当前路径，用于判断高亮
const currentPath = computed(() => route.path)

// 核心配置：8大功能目录
const menuList = [
  { name: '综合监控', path: '/dashboard' },
  { name: '数据管理', path: '/data-management' },
  { name: '光谱解析', path: '/analysis' },
  { name: '定量实验', path: '/quantitative' },
  { name: 'AI 模型', path: '/model-lab' },
  { name: '量子视图', path: '/quantum' },
  { name: '报告生成', path: '/report' },
  { name: '系统监控', path: '/system' }
]

const gotoPage = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.header-section {
  height: 80px;
  flex-shrink: 0;
  position: relative;
  background: rgba(0, 21, 41, 0.8);
  border-bottom: 1px solid rgba(80, 227, 194, 0.3);
  z-index: 999;

  .header-bg {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  .header-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 300px;

    .title-text {
      font-size: 24px;
      font-weight: bold;
      color: #b3efff;
      text-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
      letter-spacing: 2px;
      margin-bottom: 5px;
    }

    .dv-dec-6 {
      width: 200px;
      height: 8px;
    }
  }

  .nav-btn-group {
    display: flex;
    gap: 10px;
    flex: 1;
    justify-content: flex-end;
    overflow-x: auto; /* 防止屏幕太小放不下 */

    .nav-btn {
      min-width: 100px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background: rgba(0, 50, 150, 0.3);
      border: 1px solid #0055ff;
      transform: skewX(-20deg);
      cursor: pointer;
      color: #00baff;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
      position: relative;
      padding: 0 10px;

      .text {
        display: inline-block;
        transform: skewX(20deg);
      }

      &:hover {
        box-shadow: 0 0 15px #00e5ff inset;
        color: #fff;
      }

      &.active {
        background: rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
      }
    }
  }
}
</style>