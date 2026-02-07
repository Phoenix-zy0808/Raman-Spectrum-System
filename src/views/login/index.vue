<template>
  <div class="raman-login-container">
    <!-- 背景画布 -->
    <canvas ref="canvasRef" class="background-canvas"></canvas>

    <!-- 顶部标题 -->
    <div class="top-header">
      <h1 class="system-title">
        <span class="icon">◆</span>
        拉曼光谱智能检测系统
        <span class="icon">◆</span>
      </h1>
      <p class="system-subtitle">新一代高精度光学检测平台</p>
    </div>

    <!-- 登录框容器 -->
    <div class="login-wrapper">
      <div class="border-box-wrapper">
        <!-- 发光边框效果 -->
        <div class="glow-border"></div>

        <div class="login-content">
          <h2 class="login-title">系统登录</h2>

          <!-- 分割线 -->
          <div class="divider"></div>

          <!-- 用户名输入 -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-icon">►</span> 用户名
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                class="input-field"
                placeholder="请输入用户名"
                v-model="username"
                @keypress.enter="handleLogin"
              />
              <div class="input-underline"></div>
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-icon">►</span> 密码
            </label>
            <div class="input-wrapper">
              <input
                type="password"
                class="input-field"
                placeholder="请输入密码"
                v-model="password"
                @keypress.enter="handleLogin"
              />
              <div class="input-underline"></div>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            class="login-button"
            :class="{ loading: isLoading }"
            @click="handleLogin"
            :disabled="!username || !password || isLoading"
          >
            <span v-if="isLoading">
              <span class="loading-spinner"></span>
              登录中...
            </span>
            <span v-else>▶ 登录系统</span>
          </button>

          <!-- 底部信息 -->
          <div class="login-footer">
            <p class="version-info">Version 2.0.0 | Advanced Raman Detection</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 右下角装饰 -->
    <div class="corner-decoration bottom-right">
      <div class="decoration-line"></div>
      <span class="decoration-text">SYSTEM INITIALIZED</span>
    </div>

    <!-- 左下角装饰 -->
    <div class="corner-decoration bottom-left">
      <span class="decoration-text">SECURE PROTOCOL</span>
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const username = ref('')
const password = ref('')
const isLoading = ref(false)

// 绘制拉曼光谱波形背景
const drawWaveformBackground = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = window.innerWidth
  const h = window.innerHeight

  canvas.width = w
  canvas.height = h

  // 清除背景
  ctx.fillStyle = '#001529'
  ctx.fillRect(0, 0, w, h)

  // 绘制科技网格
  ctx.strokeStyle = 'rgba(0, 176, 240, 0.1)'
  ctx.lineWidth = 1
  const gridSize = 50
  for (let i = 0; i < w; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, h)
    ctx.stroke()
  }
  for (let i = 0; i < h; i += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(w, i)
    ctx.stroke()
  }

  // 绘制拉曼光谱波形 (左上角)
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = 0; x < w * 0.4; x += 5) {
    const y = h * 0.2 + Math.sin(x * 0.02) * 30 + Math.cos(x * 0.01) * 20
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 绘制拉曼光谱波形 (右下角)
  ctx.strokeStyle = 'rgba(0, 176, 240, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = w * 0.6; x < w; x += 5) {
    const y = h * 0.75 + Math.sin((x - w * 0.6) * 0.015) * 40 + Math.cos((x - w * 0.6) * 0.008) * 25
    if (x === w * 0.6) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // 绘制动态粒子效果
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const size = Math.random() * 1.5
    ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.5})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

const handleLogin = async () => {
  // 1. 检查是否为空
  if (!username.value || !password.value) {
    alert('请输入用户名和密码')
    return
  }

  isLoading.value = true
  try {
    // 模拟加载延迟（保留这个为了让效果更真实）
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 2. 核心修改：验证账号密码
    if (username.value === 'user' && password.value === '123456') {
      console.log('登录成功')
      // 跳转到首页 (确保你的路由里配置的是 /index)
      await router.push('/dashboard')
    } else {
      // 密码错误的提示
      alert('用户名或密码错误！')
    }

  } catch (error) {
    console.error('Login error:', error)
    alert('系统异常，请重试')
  } finally {
    // 无论成功失败，最后都要停止加载动画
    isLoading.value = false
  }
}

onMounted(() => {
  drawWaveformBackground()

  // 监听窗口大小变化，重新绘制背景
  const handleResize = () => {
    drawWaveformBackground()
  }

  window.addEventListener('resize', handleResize)

  // 清理事件监听器
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.raman-login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #00274d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', 'Cascadia Code', monospace;
  overflow: hidden;
  position: relative;
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.top-header {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.system-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(90deg, #00b0f0, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  margin-bottom: 10px;
}

.icon {
  color: #00ff88;
  margin: 0 10px;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.system-subtitle {
  font-size: 14px;
  color: #00b0f0;
  letter-spacing: 1px;
  opacity: 0.8;
}

.login-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
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

.border-box-wrapper {
  position: relative;
  padding: 2px;
  background: linear-gradient(135deg, #00b0f0, #00ff88, #0033cc);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.glow-border {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.2), transparent);
  pointer-events: none;
  opacity: 0.6;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.login-content {
  background: linear-gradient(135deg, rgba(0, 21, 41, 0.95) 0%, rgba(0, 51, 102, 0.9) 100%);
  backdrop-filter: blur(10px);
  padding: 50px 40px;
  position: relative;
  clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px));
}

.login-title {
  font-size: 28px;
  color: #00ff88;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #00b0f0, #00ff88, transparent);
  margin-bottom: 30px;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.input-group {
  margin-bottom: 28px;
}

.input-label {
  display: block;
  font-size: 13px;
  color: #00b0f0;
  margin-bottom: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
}

.label-icon {
  color: #00ff88;
  margin-right: 6px;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 51, 102, 0.4);
  border: 1px solid #00b0f0;
  color: #00ff88;
  font-size: 14px;
  letter-spacing: 0.5px;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 176, 240, 0.1) inset;

  &::placeholder {
    color: rgba(0, 255, 136, 0.5);
  }

  &:focus {
    background: rgba(0, 51, 102, 0.6);
    border-color: #00ff88;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3) inset, 0 0 20px rgba(0, 255, 136, 0.2);

    & ~ .input-underline {
      width: 100%;
    }
  }
}

.input-underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(90deg, #00b0f0, #00ff88);
  transition: width 0.3s ease;
}

.login-button {
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  background: linear-gradient(135deg, #00b0f0, #00ff88);
  border: 2px solid #00ff88;
  color: #001529;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transition: left 0.5s ease;
    z-index: -1;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading {
    background: linear-gradient(135deg, #006680, #004d44);
  }
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 21, 41, 0.3);
  border-top-color: #001529;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.version-info {
  font-size: 11px;
  color: #00b0f0;
  opacity: 0.7;
  letter-spacing: 1px;
}

.corner-decoration {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #00b0f0;
  letter-spacing: 2px;
  z-index: 5;
}

.decoration-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, #00b0f0, transparent);
}

.bottom-right {
  bottom: 20px;
  right: 20px;
  animation: fadeInRight 1s ease-out 0.3s both;
}

.bottom-left {
  bottom: 20px;
  left: 20px;
  flex-direction: row-reverse;
  animation: fadeInLeft 1s ease-out 0.3s both;
}

.decoration-text {
  white-space: nowrap;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 600px) {
  .raman-login-container {
    padding: 20px;
  }

  .login-wrapper {
    max-width: 100%;
  }

  .system-title {
    font-size: 24px;
  }

  .login-content {
    padding: 40px 25px;
  }

  .login-title {
    font-size: 22px;
  }
}
</style>