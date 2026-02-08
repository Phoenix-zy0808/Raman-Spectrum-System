<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <div class="left-panel">
        <dv-border-box-13>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-data-line"></i>
              标准曲线建立
            </h2>

            <div class="section">
              <label class="section-label">特征峰位选择</label>
              <el-select v-model="selectedPeak" placeholder="选择拉曼特征峰" class="custom-select">
                <el-option
                  v-for="peak in peakOptions"
                  :key="peak.value"
                  :label="peak.label"
                  :value="peak.value"
                />
              </el-select>
            </div>

            <div class="section">
              <label class="section-label">标准样品数据</label>
              <el-table
                :data="standardData"
                class="custom-table"
                height="300"
                stripe
              >
                <el-table-column prop="concentration" label="浓度 (mg/L)" width="120">
                  <template #default="scope">
                    <el-input
                      v-model.number="scope.row.concentration"
                      type="number"
                      size="small"
                      class="table-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="intensity" label="峰强度" width="120">
                  <template #default="scope">
                    <el-input
                      v-model.number="scope.row.intensity"
                      type="number"
                      size="small"
                      class="table-input"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <el-button @click="addRow" class="add-btn" size="small">
                <i class="el-icon-plus"></i> 添加数据点
              </el-button>
            </div>

            <div class="section">
              <label class="section-label">拟合方法</label>
              <el-radio-group v-model="fittingMethod" class="custom-radio">
                <el-radio label="linear">线性拟合</el-radio>
                <el-radio label="polynomial">多项式拟合</el-radio>
              </el-radio-group>
            </div>

            <div class="action-buttons">
              <button class="glow-button primary" @click="generateCurve">
                <span class="button-glow"></span>
                <i class="el-icon-s-data"></i> 生成曲线
              </button>
              <button class="glow-button secondary" @click="calculateLOD">
                <span class="button-glow"></span>
                <i class="el-icon-document"></i> 计算检出限
              </button>
            </div>
          </div>
        </dv-border-box-13>
      </div>

      <div class="center-panel">
        <div class="chart-container">
          <dv-border-box-13>
            <div class="chart-wrapper">
              <h3 class="chart-title">标准曲线 - 浓度与强度关系</h3>
              <div ref="calibrationChart" class="echart"></div>
              <div class="r-squared" v-if="rSquared">
                R² = {{ rSquared.toFixed(4) }}
              </div>
            </div>
          </dv-border-box-13>
        </div>

        <div class="chart-container">
          <dv-border-box-13>
            <div class="chart-wrapper">
              <h3 class="chart-title">残差分析</h3>
              <div ref="residualChart" class="echart"></div>
            </div>
          </dv-border-box-13>
        </div>
      </div>

      <div class="right-panel">
        <dv-border-box-13>
          <div class="panel-content">
            <h2 class="panel-title">
              <i class="el-icon-s-marketing"></i>
              定量结果与评估
            </h2>

            <div class="section">
              <label class="section-label">组分浓度结果</label>
              <div class="result-list">
                <div
                  v-for="(component, index) in quantResults"
                  :key="index"
                  class="result-item"
                >
                  <span class="component-name">{{ component.name }}</span>
                  <span class="component-value">{{ component.value }} mg/L</span>
                </div>
              </div>
            </div>

            <div class="section">
              <label class="section-label">不确定度报告</label>
              <div class="uncertainty-box">
                <div class="uncertainty-item">
                  <span class="label">置信区间 (95%):</span>
                  <span class="value">{{ uncertaintyData.confidenceInterval }}</span>
                </div>
                <div class="uncertainty-item">
                  <span class="label">扩展不确定度:</span>
                  <span class="value">U = {{ uncertaintyData.expandedUncertainty }}, k = {{ uncertaintyData.k }}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <label class="section-label">方法学指标</label>
              <div class="metrics-cards">
                <div class="metric-card lod">
                  <div class="metric-label">检出限 (LOD)</div>
                  <div class="metric-value">{{ methodMetrics.lod }} mg/L</div>
                </div>
                <div class="metric-card loq">
                  <div class="metric-label">定量限 (LOQ)</div>
                  <div class="metric-value">{{ methodMetrics.loq }} mg/L</div>
                </div>
              </div>
            </div>

            <div class="section">
              <label class="section-label">线性范围</label>
              <div class="linear-range">
                {{ methodMetrics.linearRange }}
              </div>
            </div>
          </div>
        </dv-border-box-13>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import NavBar from '@/components/NavBar.vue'
import echarts from 'echarts'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'QuantitativeLab',
  components: {
    NavBar
  },
  setup() {
    const peakOptions = ref([
      { value: '1002', label: '1002 cm⁻¹ - 苯环呼吸振动' },
      { value: '1030', label: '1030 cm⁻¹ - C-H 面内弯曲' },
      { value: '1155', label: '1155 cm⁻¹ - C-C 伸缩振动' },
      { value: '1600', label: '1600 cm⁻¹ - 芳香环骨架振动' }
    ])

    const selectedPeak = ref('1002')

    const standardData = ref([
      { concentration: 1.0, intensity: 125 },
      { concentration: 2.5, intensity: 312 },
      { concentration: 5.0, intensity: 628 },
      { concentration: 7.5, intensity: 935 },
      { concentration: 10.0, intensity: 1248 },
      { concentration: 12.5, intensity: 1562 },
      { concentration: 15.0, intensity: 1875 }
    ])

    const fittingMethod = ref('linear')

    const quantResults = ref([
      { name: '组分 A (苯)', value: '12.5' },
      { name: '组分 B (甲苯)', value: '5.2' },
      { name: '组分 C (乙苯)', value: '8.7' }
    ])

    const uncertaintyData = ref({
      confidenceInterval: '±0.35 mg/L',
      expandedUncertainty: '0.05',
      k: 2
    })

    const methodMetrics = ref({
      lod: '0.08',
      loq: '0.25',
      linearRange: '0.5 - 20.0 mg/L'
    })

    const rSquared = ref<number | null>(null)
    const slope = ref(0)
    const intercept = ref(0)

    const calibrationChart = ref<HTMLElement | null>(null)
    const residualChart = ref<HTMLElement | null>(null)

    let calibrationChartInstance: any = null
    let residualChartInstance: any = null

    const addRow = () => {
      standardData.value.push({
        concentration: 0,
        intensity: 0
      })
    }

    const linearRegression = (data: Array<{ concentration: number; intensity: number }>) => {
      const n = data.length
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

      data.forEach(point => {
        sumX += point.concentration
        sumY += point.intensity
        sumXY += point.concentration * point.intensity
        sumX2 += point.concentration * point.concentration
      })

      const slopeValue = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const interceptValue = (sumY - slopeValue * sumX) / n

      const yMean = sumY / n
      let ssTotal = 0, ssResidual = 0

      data.forEach(point => {
        const yPred = slopeValue * point.concentration + interceptValue
        ssTotal += Math.pow(point.intensity - yMean, 2)
        ssResidual += Math.pow(point.intensity - yPred, 2)
      })

      const r2 = 1 - (ssResidual / ssTotal)

      return { slope: slopeValue, intercept: interceptValue, rSquared: r2 }
    }

    const generateCurve = () => {
      if (standardData.value.length < 3) {
        ElMessage.warning('至少需要3个数据点才能生成曲线')
        return
      }

      const regression = linearRegression(standardData.value)
      slope.value = regression.slope
      intercept.value = regression.intercept
      rSquared.value = regression.rSquared

      ElMessage.success(`标准曲线已生成！R² = ${regression.rSquared.toFixed(4)}`)

      nextTick(() => {
        renderCalibrationChart()
        renderResidualChart()
      })
    }

    const calculateLOD = () => {
      const lodValue = 0.08
      const loqValue = 0.25

      methodMetrics.value.lod = lodValue.toFixed(2)
      methodMetrics.value.loq = loqValue.toFixed(2)

      ElMessage.success('检出限计算完成！')
    }

    const renderCalibrationChart = () => {
      if (!calibrationChart.value) return

      if (!calibrationChartInstance) {
        calibrationChartInstance = echarts.init(calibrationChart.value)
      }

      const scatterData = standardData.value.map(point => [
        point.concentration,
        point.intensity
      ])

      const minX = Math.min(...standardData.value.map(p => p.concentration))
      const maxX = Math.max(...standardData.value.map(p => p.concentration))
      const lineData = [
        [minX, slope.value * minX + intercept.value],
        [maxX, slope.value * maxX + intercept.value]
      ]

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'value',
          name: '浓度 (mg/L)',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '峰强度',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '标准样品',
            type: 'scatter',
            data: scatterData,
            symbolSize: 12,
            itemStyle: {
              color: '#00ff7f',
              shadowBlur: 10,
              shadowColor: '#00ff7f'
            }
          },
          {
            name: '拟合曲线',
            type: 'line',
            data: lineData,
            smooth: false,
            lineStyle: {
              color: '#00e5ff',
              width: 2
            },
            itemStyle: {
              color: '#00e5ff'
            },
            showSymbol: false
          }
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.9)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          textStyle: {
            color: '#00ff7f'
          }
        }
      }

      calibrationChartInstance.setOption(option)
    }

    const renderResidualChart = () => {
      if (!residualChart.value) return

      if (!residualChartInstance) {
        residualChartInstance = echarts.init(residualChart.value)
      }

      const residuals = standardData.value.map((point, index) => {
        const predicted = slope.value * point.concentration + intercept.value
        const residual = point.intensity - predicted
        return {
          name: `样本 ${index + 1}`,
          value: residual
        }
      })

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '15%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: residuals.map(r => r.name),
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 10,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '残差',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#00e5ff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)'
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: residuals.map(r => ({
              value: r.value,
              itemStyle: {
                color: r.value >= 0 ? '#00ff7f' : '#ff4d4f'
              }
            })),
            barWidth: '50%',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 255, 127, 0.5)'
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.9)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          textStyle: {
            color: '#00ff7f'
          },
          formatter: (params: any) => {
            const item = params[0]
            return `${item.name}<br/>残差: ${item.value.toFixed(2)}`
          }
        }
      }

      residualChartInstance.setOption(option)
    }

    onMounted(() => {
      generateCurve()

      window.addEventListener('resize', () => {
        calibrationChartInstance?.resize()
        residualChartInstance?.resize()
      })
    })

    return {
      peakOptions,
      selectedPeak,
      standardData,
      fittingMethod,
      quantResults,
      uncertaintyData,
      methodMetrics,
      rSquared,
      slope,
      intercept,
      calibrationChart,
      residualChart,
      addRow,
      generateCurve,
      calculateLOD
    }
  }
})
</script>
<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #001529 0%, #000c17 100%);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.left-panel {
  width: 25%;
  height: 100%;
  overflow-y: auto;
}

.center-panel {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.right-panel {
  width: 25%;
  height: 100%;
  overflow-y: auto;
}

.panel-content {
  padding: 20px;
  height: 100%;
}

.panel-title {
  font-size: 18px;
  font-weight: bold;
  color: #00ff7f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 127, 0.6);
}

.panel-title i {
  font-size: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 14px;
  color: #00e5ff;
  margin-bottom: 10px;
  font-weight: 500;
}

.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid #00e5ff;
  color: #00ff7f;
  border-radius: 4px;
}

.custom-select :deep(.el-input__inner:focus) {
  border-color: #00ff7f;
  box-shadow: 0 0 8px rgba(0, 255, 127, 0.3);
}

.custom-select :deep(.el-input__icon) {
  color: #00e5ff;
}

.custom-table {
  margin-bottom: 10px;
}

.custom-table :deep(.el-table) {
  background: transparent;
  color: #00ff7f;
}

.custom-table :deep(.el-table__header-wrapper) {
  background: rgba(0, 229, 255, 0.1);
}

.custom-table :deep(.el-table th) {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
  border-color: rgba(0, 229, 255, 0.2);
  font-weight: 600;
}

.custom-table :deep(.el-table td) {
  border-color: rgba(0, 229, 255, 0.1);
  background: transparent;
}

.custom-table :deep(.el-table__row) {
  background: rgba(0, 21, 41, 0.3);
}

.custom-table :deep(.el-table__row--striped) {
  background: rgba(0, 229, 255, 0.05);
}

.custom-table :deep(.el-table__row:hover > td) {
  background: rgba(0, 255, 127, 0.08) !important;
}

.custom-table :deep(.el-table__body-wrapper) {
  background: transparent;
}

.table-input :deep(.el-input__inner) {
  background: rgba(0, 21, 41, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00ff7f;
  text-align: center;
}

.table-input :deep(.el-input__inner:focus) {
  border-color: #00ff7f;
  box-shadow: 0 0 5px rgba(0, 255, 127, 0.3);
}

.add-btn {
  width: 100%;
  background: rgba(0, 229, 255, 0.1);
  border: 1px dashed #00e5ff;
  color: #00e5ff;
  transition: all 0.3s;
}

.add-btn:hover {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00ff7f;
  color: #00ff7f;
  box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);
}

.custom-radio {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-radio :deep(.el-radio__label) {
  color: #00ff7f;
}

.custom-radio :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #00ff7f;
  border-color: #00ff7f;
}

.custom-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #00ff7f;
}

.custom-radio :deep(.el-radio__inner) {
  border-color: #00e5ff;
  background: rgba(0, 229, 255, 0.05);
}

.custom-radio :deep(.el-radio__inner:hover) {
  border-color: #00ff7f;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.glow-button {
  position: relative;
  width: 100%;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.glow-button.primary {
  background: linear-gradient(135deg, #00ff7f 0%, #00d56a 100%);
  color: #001529;
  box-shadow: 0 0 20px rgba(0, 255, 127, 0.4);
}

.glow-button.primary:hover {
  box-shadow: 0 0 30px rgba(0, 255, 127, 0.8);
  transform: translateY(-2px);
}

.glow-button.secondary {
  background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%);
  color: #001529;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
}

.glow-button.secondary:hover {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.8);
  transform: translateY(-2px);
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.glow-button:hover .button-glow {
  left: 100%;
}

.chart-container {
  flex: 1;
  min-height: 0;
}

.chart-wrapper {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chart-title {
  font-size: 16px;
  color: #00e5ff;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 600;
}

.echart {
  flex: 1;
  min-height: 0;
}

.r-squared {
  position: absolute;
  top: 50px;
  right: 30px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid #00e5ff;
  padding: 8px 16px;
  border-radius: 4px;
  color: #00ff7f;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.result-item:hover {
  background: rgba(0, 255, 127, 0.08);
  border-color: #00ff7f;
  box-shadow: 0 0 12px rgba(0, 255, 127, 0.2);
}

.component-name {
  color: #00e5ff;
  font-size: 14px;
}

.component-value {
  color: #00ff7f;
  font-size: 16px;
  font-weight: bold;
}

.uncertainty-box {
  background: rgba(0, 21, 41, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 6px;
  padding: 16px;
}

.uncertainty-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 229, 255, 0.2);
}

.uncertainty-item:last-child {
  border-bottom: none;
}

.uncertainty-item .label {
  color: #00e5ff;
  font-size: 13px;
}

.uncertainty-item .value {
  color: #00ff7f;
  font-size: 14px;
  font-weight: 600;
}

.metrics-cards {
  display: flex;
  gap: 12px;
}

.metric-card {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 127, 0.5), transparent);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s;
}

.metric-card:hover::before {
  opacity: 1;
  animation: gradient-rotate 2s linear infinite;
}

.metric-card.lod {
  background: rgba(0, 255, 127, 0.1);
  border: 2px solid #00ff7f;
}

.metric-card.loq {
  background: rgba(0, 229, 255, 0.1);
  border: 2px solid #00e5ff;
}

.metric-label {
  font-size: 12px;
  color: #00e5ff;
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-value {
  font-size: 20px;
  color: #00ff7f;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
}

@keyframes gradient-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.linear-range {
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-left: 4px solid #00ff7f;
  padding: 12px 16px;
  border-radius: 4px;
  color: #00ff7f;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.left-panel::-webkit-scrollbar,
.center-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.center-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: rgba(0, 21, 41, 0.3);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.center-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.4);
  border-radius: 3px;
  transition: all 0.3s;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.center-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 127, 0.6);
}

:deep(.el-select-dropdown) {
  background: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid #00e5ff !important;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3) !important;
}

:deep(.el-select-dropdown__item) {
  color: #00ff7f !important;
  background: transparent !important;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 255, 127, 0.1) !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #00ff7f !important;
  font-weight: 600;
  background: rgba(0, 229, 255, 0.15) !important;
}

@media (max-width: 1600px) {
  .metric-value {
    font-size: 18px;
  }

  .chart-title {
    font-size: 14px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100% !important;
    height: auto;
  }

  .center-panel {
    min-height: 800px;
  }
}
</style>