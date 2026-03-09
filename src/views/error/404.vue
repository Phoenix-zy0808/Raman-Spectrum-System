<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">
        <span class="digit digit-1">4</span>
        <span class="digit digit-2">0</span>
        <span class="digit digit-3">4</span>
      </div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      <div class="error-actions">
        <button class="action-button primary" @click="goHome">
          <span class="icon">►</span> 返回首页
        </button>
        <button class="action-button secondary" @click="goBack">
          <span class="icon">◄</span> 返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.error-page {
  @include fill-container;
  @include center(flex);
  background: linear-gradient(135deg, $bg-darker 0%, $bg-light 100%);
  font-family: 'Courier New', 'Cascadia Code', monospace;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(0, 176, 240, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 176, 240, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }
}

.error-content {
  text-align: center;
  z-index: 1;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.digit {
  font-size: 120px;
  font-weight: bold;
  background: linear-gradient(180deg, $primary-light, $secondary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
  animation: pulse 2s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.error-title {
  font-size: 32px;
  color: $text-primary;
  margin-bottom: 15px;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
}

.error-message {
  font-size: 16px;
  color: $text-regular;
  margin-bottom: 40px;
  opacity: 0.8;
}

.error-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-button {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &.primary {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: $bg-darker;
    border: 2px solid $secondary-color;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      transition: left 0.5s ease;
    }

    &:hover {
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
      transform: translateY(-2px);

      &::before {
        left: 100%;
      }
    }
  }

  &.secondary {
    background: transparent;
    color: $primary-light;
    border: 2px solid $primary-color;

    &:hover {
      background: $transparent-hover;
      box-shadow: 0 0 20px rgba(0, 176, 240, 0.4);
      transform: translateY(-2px);
    }
  }

  .icon {
    margin-right: 8px;
    display: inline-block;
  }
}

@media (max-width: 600px) {
  .digit {
    font-size: 60px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-message {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
    gap: 15px;
  }

  .action-button {
    width: 100%;
  }
}
</style>
