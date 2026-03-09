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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 自动获取当前路径，用于判断高亮
const currentPath = computed(() => route.path)

// 核心配置：功能菜单（隐藏未完成的页面）
const menuList = [
  { name: '综合监控', path: '/dashboard' },
  { name: '数据管理', path: '/data-management' },
  { name: '光谱解析', path: '/analysis' },
  { name: '定量实验', path: '/quantitative' },
  { name: 'AI 模型', path: '/model-lab' },
  // { name: '量子视图', path: '/quantum' }, // 暂未完成，隐藏入口
  { name: '报告生成', path: '/report' },
  // { name: '系统监控', path: '/system' } // 暂未完成，隐藏入口
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
    }

    .dv-dec-6 {
      width: 100%;
      height: 3px;
      margin-top: 8px;
    }
  }

  .nav-btn-group {
    display: flex;
    gap: 12px;
  }

  .nav-btn {
    position: relative;
    padding: 10px 20px;
    cursor: pointer;
    overflow: hidden;
    border: 1px solid rgba(80, 227, 194, 0.3);
    border-radius: 4px;
    background: rgba(0, 21, 41, 0.6);
    transition: all 0.3s ease;

    .text {
      font-size: 14px;
      color: rgba(179, 239, 255, 0.8);
      position: relative;
      z-index: 2;
    }

    .react-before,
    .react-after {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      content: '';
      z-index: 1;
      transition: all 0.3s ease;
    }

    .react-before {
      background: linear-gradient(90deg, transparent, rgba(80, 227, 194, 0.2), transparent);
      transform: translateX(-100%);
    }

    .react-after {
      background: linear-gradient(90deg, transparent, rgba(80, 227, 194, 0.1), transparent);
      transform: translateX(100%);
    }

    &:hover {
      border-color: rgba(80, 227, 194, 0.6);
      box-shadow: 0 0 15px rgba(80, 227, 194, 0.3);

      .react-before {
        transform: translateX(0);
      }
    }

    &.active {
      background: rgba(80, 227, 194, 0.2);
      border-color: #50e3c2;
      box-shadow: 0 0 20px rgba(80, 227, 194, 0.5);

      .text {
        color: #fff;
        font-weight: 600;
      }
    }
  }
}
</style>
