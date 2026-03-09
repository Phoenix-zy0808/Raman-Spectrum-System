<template>
  <div ref="chartContainer" class="spectrum-chart" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineExpose } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { SpectrumDataPoint } from '@/store/spectrum'

// ─────────────────────── Props ───────────────────────
interface ChartProps {
  data?: SpectrumDataPoint[]
  height?: string
  peakLabels?: Array<{ x: number; label: string }>
  showDataZoom?: boolean
  showLegend?: boolean
  theme?: 'dark' | 'light'
}

const props = withDefaults(defineProps<ChartProps>(), {
  data: () => [],
  height: '400px',
  peakLabels: () => [],
  showDataZoom: true,
  showLegend: false,
  theme: 'dark',
})

// ─────────────────────── 状态 ───────────────────────
const chartContainer = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

// ─────────────────────── 方法 ───────────────────────
/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartContainer.value) return
  chart = echarts.init(chartContainer.value)
  updateOption()
}

/**
 * 更新图表配置
 */
const updateOption = () => {
  if (!chart) return

  const markLines = props.peakLabels.map(p => ({
    xAxis: p.x,
    label: {
      formatter: p.label,
      rotate: 90,
      color: '#00e5ff',
      fontSize: 10,
      fontWeight: 'bold',
      position: 'insideEndTop' as const,
      distance: 8,
      backgroundColor: 'rgba(0,12,35,0.7)',
      padding: [2, 4],
      borderRadius: 2,
    },
    lineStyle: { color: 'rgba(0,200,255,0.28)', width: 1, type: 'dashed' as const },
  }))

  const dataZoomConfig = props.showDataZoom ? [{
    type: 'slider' as const,
    xAxisIndex: 0,
    bottom: 4,
    height: 40,
    borderColor: 'rgba(0,246,255,0.32)',
    backgroundColor: 'rgba(0,18,50,0.88)',
    dataBackground: {
      lineStyle: { color: '#0099cc', width: 1 },
      areaStyle: { color: 'rgba(0,75,155,0.45)' },
    },
    selectedDataBackground: {
      lineStyle: { color: '#00f6ff', width: 1.5 },
      areaStyle: { color: 'rgba(0,100,200,0.58)' },
    },
    fillerColor: 'rgba(0,100,200,0.18)',
    handleStyle: { color: '#00f6ff', borderColor: '#00f6ff', borderWidth: 2 },
    moveHandleStyle: { color: '#00f6ff' },
    emphasis: { handleStyle: { color: '#00ff88', borderColor: '#00ff88' } },
    textStyle: { color: '#00c8ff', fontSize: 11 },
    labelFormatter: (v: number) => `${Math.round(v)}`,
  }, {
    type: 'inside' as const,
    xAxisIndex: 0,
  }] : []

  chart.setOption({
    backgroundColor: 'transparent',
    animation: false,
    grid: {
      left: 72,
      right: 20,
      top: 40,
      bottom: props.showDataZoom ? 90 : 50,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,12,35,0.95)',
      borderColor: '#00f6ff',
      borderWidth: 1,
      textStyle: { color: '#00f6ff', fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        return `<b style="color:#00ff88">波数：${p.data[0]} cm⁻¹</b><br/>强度：${(p.data[1] as number).toFixed(2)}`
      },
    },
    xAxis: {
      type: 'value',
      name: '拉曼位移 (cm⁻¹)',
      min: 400,
      max: 4000,
      inverse: true,
      nameLocation: 'middle',
      nameGap: 48,
      nameTextStyle: { color: '#00c8ff', fontSize: 13, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#00f6ff', width: 1.5 } },
      axisTick: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#b0e8ff', fontSize: 11, margin: 8 },
      splitLine: { lineStyle: { color: 'rgba(0,246,255,0.07)', width: 1 } },
    },
    yAxis: {
      type: 'value',
      name: '强度 (a.u.)',
      nameLocation: 'middle',
      nameGap: 52,
      nameTextStyle: { color: '#00c8ff', fontSize: 13, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#00f6ff', width: 1.5 } },
      axisTick: { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#b0e8ff', fontSize: 11, margin: 6 },
      splitLine: { lineStyle: { color: 'rgba(0,246,255,0.07)', width: 1 } },
    },
    dataZoom: dataZoomConfig,
    legend: props.showLegend ? {
      show: true,
      top: 10,
      right: 20,
      textStyle: { color: '#00c8ff', fontSize: 11 },
      data: ['当前光谱'],
    } : undefined,
    series: [{
      type: 'line',
      data: props.data.map(p => [p.x, p.y]),
      smooth: false,
      showSymbol: false,
      lineStyle: { width: 1.5, color: '#ff4040' },
      name: '当前光谱',
      markLine: {
        silent: true,
        animation: false,
        symbol: ['none', 'none'],
        data: markLines,
      },
    }],
  })
}

/**
 * 更新数据
 */
const updateData = (newData: SpectrumDataPoint[]) => {
  if (!chart) return
  chart.setOption({
    series: [{
      data: newData.map(p => [p.x, p.y]),
    }],
  })
}

/**
 * 设置选项
 */
const setOption = (option: echarts.EChartsOption) => {
  if (!chart) return
  chart.setOption(option)
}

/**
 * 显示加载动画
 */
const showLoading = () => {
  if (!chart) return
  chart.showLoading({
    text: '加载中...',
    color: '#00f6ff',
    textColor: '#00c8ff',
    maskColor: 'rgba(0, 21, 41, 0.8)',
    lineStyle: { width: 2, color: '#00f6ff' },
  })
}

/**
 * 隐藏加载动画
 */
const hideLoading = () => {
  if (!chart) return
  chart.hideLoading()
}

/**
 * 调整大小
 */
const resize = () => {
  if (!chart) return
  chart.resize()
}

/**
 * 销毁图表
 */
const dispose = () => {
  if (!chart) return
  chart.dispose()
  chart = null
}

// ─────────────────────── 生命周期 ───────────────────────
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  dispose()
})

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData.length > 0) {
    updateData(newData)
  }
}, { deep: true })

// 监听 peakLabels 变化
watch(() => props.peakLabels, () => {
  updateOption()
}, { deep: true })

// ─────────────────────── 暴露接口 ───────────────────────
defineExpose({
  chartRef: () => chart,
  initChart,
  updateData,
  setOption,
  resize,
  showLoading,
  hideLoading,
  dispose,
})
</script>

<style scoped lang="scss">
.spectrum-chart {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
