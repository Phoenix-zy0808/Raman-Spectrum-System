<template>
  <div class="global-loading" v-if="visible">
    <div class="loading-overlay"></div>
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ text }}</p>
      <p v-if="showProgress" class="loading-progress">{{ progress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue'

const visible = ref(false)
const text = ref('加载中...')
const progress = ref(0)
const showProgress = ref(false)

/**
 * 显示加载
 */
const show = (options: { text?: string; showProgress?: boolean } = {}) => {
  text.value = options.text || '加载中...'
  showProgress.value = options.showProgress || false
  progress.value = 0
  visible.value = true
}

/**
 * 隐藏加载
 */
const hide = () => {
  visible.value = false
}

/**
 * 更新进度
 */
const updateProgress = (value: number) => {
  progress.value = value
}

defineExpose({
  show,
  hide,
  updateProgress,
})
</script>

<style scoped lang="scss">
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 21, 41, 0.85);
  backdrop-filter: blur(4px);
}

.loading-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: #00f6ff;
    border-radius: 50%;
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

    &:nth-child(2) {
      width: 60%;
      height: 60%;
      top: 20%;
      left: 20%;
      border-top-color: #00ff88;
      animation-delay: -0.5s;
    }

    &:nth-child(3) {
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
      border-top-color: #00b0f0;
      animation-delay: -1s;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #00c8ff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

.loading-progress {
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
}
</style>
