<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <div class="left-panel">
        <dv-border-box-11 title="报告配置">
          <div class="panel-content">
            <el-form :model="reportConfig" label-position="top" class="config-form">
              <el-form-item label="实验名称" class="form-item">
                <el-input
                  v-model="reportConfig.experimentName"
                  placeholder="请输入实验名称"
                  class="custom-input"
                />
              </el-form-item>

              <el-form-item label="操作人员" class="form-item">
                <el-input
                  v-model="reportConfig.operator"
                  placeholder="请输入操作人员"
                  class="custom-input"
                />
              </el-form-item>

              <el-form-item label="实验日期" class="form-item">
                <el-date-picker
                  v-model="reportConfig.experimentDate"
                  type="date"
                  placeholder="选择日期"
                  class="custom-date-picker"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>

            <div class="template-section">
              <h3 class="section-title">报告模板</h3>
              <div class="template-cards">
                <div
                  v-for="template in templateOptions"
                  :key="template.id"
                  class="template-card"
                  :class="{ active: selectedTemplate === template.id }"
                  @click="selectTemplate(template.id)"
                >
                  <div class="card-icon">
                    <i :class="template.icon"></i>
                  </div>
                  <div class="card-title">{{ template.name }}</div>
                  <div class="card-desc">{{ template.description }}</div>
                  <div class="card-glow"></div>
                </div>
              </div>
            </div>
          </div>
        </dv-border-box-11>
      </div>

      <div class="center-panel">
        <dv-border-box-11 title="交互式光谱标注">
          <div class="chart-section">
            <div class="chart-toolbar">
              <el-button
                :type="activeTool === 'peak' ? 'primary' : 'default'"
                size="small"
                class="tool-button"
                @click="setActiveTool('peak')"
              >
                <i class="el-icon-s-data"></i> 峰位测量
              </el-button>
              <el-button
                :type="activeTool === 'zoom' ? 'primary' : 'default'"
                size="small"
                class="tool-button"
                @click="setActiveTool('zoom')"
              >
                <i class="el-icon-zoom-in"></i> 区域放大
              </el-button>
              <el-button
                size="small"
                class="tool-button export-btn"
                @click="captureChart"
              >
                <i class="el-icon-camera"></i> 截图到报告
              </el-button>
            </div>

            <div ref="spectrumChart" class="spectrum-chart"></div>

            <div class="annotation-tip" v-if="activeTool === 'peak'">
              <i class="el-icon-info"></i>
              点击光谱曲线添加峰位标注
            </div>
          </div>
        </dv-border-box-11>
      </div>

      <div class="right-panel">
        <dv-border-box-11 title="报告预览">
          <div class="panel-content">
            <div class="outline-section">
              <h3 class="section-title">内容大纲</h3>
              <div class="outline-list">
                <div
                  v-for="(item, index) in reportOutline"
                  :key="index"
                  class="outline-item"
                  :class="{ checked: item.included }"
                  @click="toggleOutlineItem(index)"
                >
                  <i :class="item.included ? 'el-icon-check' : 'el-icon-close'"></i>
                  <span>{{ item.title }}</span>
                </div>
              </div>
            </div>

            <div class="chart-library-section">
              <h3 class="section-title">待插入图表</h3>
              <div class="chart-library">
                <el-tag
                  v-for="chart in chartLibrary"
                  :key="chart.id"
                  class="chart-tag"
                  :type="chart.inserted ? 'success' : 'info'"
                  @click="toggleChartInsertion(chart.id)"
                  effect="dark"
                >
                  <i :class="chart.icon"></i>
                  {{ chart.name }}
                </el-tag>
              </div>
            </div>

            <div class="export-section">
              <h3 class="section-title">一键导出</h3>
              <div class="export-buttons">
                <button class="export-button pdf-button" @click="exportReport('pdf')">
                  <span class="button-glow"></span>
                  <i class="el-icon-document"></i>
                  <span>导出 PDF</span>
                </button>
                <button class="export-button word-button" @click="exportReport('word')">
                  <span class="button-glow"></span>
                  <i class="el-icon-edit"></i>
                  <span>导出 Word</span>
                </button>
              </div>
            </div>

            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">标注数量</span>
                <span class="stat-value">{{ annotations.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">插入图表</span>
                <span class="stat-value">{{ insertedChartsCount }}</span>
              </div>
            </div>
          </div>
        </dv-border-box-11>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import NavBar from '@/components/NavBar.vue'
import echarts from 'echarts'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'ReportGenerator',
  components: {
    NavBar
  },
  setup() {
    const reportConfig = ref({
      experimentName: '苯系物混合样品拉曼分析',
      operator: '张研究员',
      experimentDate: new Date()
    })

    const templateOptions = ref([
      {
        id: 'academic',
        name: '学术论文',
        description: '适用于期刊投稿',
        icon: 'el-icon-reading'
      },
      {
        id: 'qc',
        name: '质检报告',
        description: '实验室标准格式',
        icon: 'el-icon-document-checked'
      },
      {
        id: 'brief',
        name: '简报模式',
        description: '快速汇报展示',
        icon: 'el-icon-tickets'
      }
    ])

    const selectedTemplate = ref('academic')

    const reportOutline = ref([
      { title: '1. 实验目的与背景', included: true },
      { title: '2. 拉曼光谱图', included: true },
      { title: '3. 定量分析结果', included: true },
      { title: '4. 质谱数据对比', included: false },
      { title: '5. 统计学分析', included: true },
      { title: '6. 结论与建议', included: true }
    ])

    const chartLibrary = ref([
      { id: '3d-imaging', name: '3D成像图', icon: 'el-icon-picture-outline', inserted: false },
      { id: 'pca-scatter', name: 'PCA散点图', icon: 'el-icon-s-data', inserted: false },
      { id: 'heatmap', name: '热力图', icon: 'el-icon-s-marketing', inserted: false },
      { id: 'calibration', name: '标准曲线', icon: 'el-icon-trend-charts', inserted: false }
    ])

    const activeTool = ref('peak')
    const annotations = ref<Array<{ x: number; y: number; label: string }>>([])
    const spectrumChart = ref<HTMLElement | null>(null)
    let spectrumChartInstance: any = null

    const generateSpectrumData = () => {
      const data: Array<[number, number]> = []
      for (let i = 400; i <= 2000; i += 2) {
        let intensity = Math.random() * 100 + 50

        if (Math.abs(i - 1002) < 10) intensity += 800 * Math.exp(-Math.pow((i - 1002) / 5, 2))
        if (Math.abs(i - 1030) < 10) intensity += 500 * Math.exp(-Math.pow((i - 1030) / 5, 2))
        if (Math.abs(i - 1155) < 10) intensity += 600 * Math.exp(-Math.pow((i - 1155) / 5, 2))
        if (Math.abs(i - 1600) < 10) intensity += 700 * Math.exp(-Math.pow((i - 1600) / 5, 2))

        data.push([i, intensity])
      }
      return data
    }

    const spectrumData = ref(generateSpectrumData())

    const insertedChartsCount = computed(() => {
      return chartLibrary.value.filter(chart => chart.inserted).length
    })

    const selectTemplate = (templateId: string) => {
      selectedTemplate.value = templateId
      const template = templateOptions.value.find(t => t.id === templateId)
      if (template) {
        ElMessage.success(`已切换到 ${template.name}`)
      }
    }

    const toggleOutlineItem = (index: number) => {
      reportOutline.value[index].included = !reportOutline.value[index].included
    }

    const toggleChartInsertion = (chartId: string) => {
      const chart = chartLibrary.value.find(c => c.id === chartId)
      if (chart) {
        chart.inserted = !chart.inserted
        const action = chart.inserted ? '已添加' : '已移除'
        ElMessage.info(`${chart.name} ${action}`)
      }
    }

    const setActiveTool = (tool: string) => {
      activeTool.value = tool
      if (tool === 'zoom') {
        ElMessage.info('区域放大模式已开启，请在图表上框选区域')
      }
    }

    const captureChart = () => {
      ElMessage.success('光谱图已保存到报告')
    }

    const exportReport = (format: string) => {
      const formatName = format === 'pdf' ? 'PDF' : 'Word'

      const loadingInstance = ElMessage({
        message: `正在生成 ${formatName} 报告...`,
        type: 'info',
        duration: 0
      })

      setTimeout(() => {
        loadingInstance.close()
        ElMessage.success(`${formatName} 报告生成成功！`)
      }, 2000)
    }

    const renderSpectrumChart = () => {
      if (!spectrumChart.value) return

      if (!spectrumChartInstance) {
        spectrumChartInstance = echarts.init(spectrumChart.value)
      }

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '8%',
          right: '5%',
          top: '10%',
          bottom: '12%'
        },
        xAxis: {
          type: 'value',
          name: '拉曼位移 (cm⁻¹)',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 13,
            fontWeight: 600
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff',
              width: 2
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 11
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '强度 (a.u.)',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 13,
            fontWeight: 600
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff',
              width: 2
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 11
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '拉曼光谱',
            type: 'line',
            data: spectrumData.value,
            smooth: true,
            lineStyle: {
              color: '#00e5ff',
              width: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 229, 255, 0.5)'
            },
            itemStyle: {
              color: '#00e5ff'
            },
            showSymbol: false,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 229, 255, 0.3)' },
                  { offset: 1, color: 'rgba(0, 229, 255, 0.05)' }
                ]
              }
            },
            markPoint: {
              data: annotations.value.map(ann => ({
                coord: [ann.x, ann.y],
                value: ann.label,
                itemStyle: {
                  color: '#ff6b00',
                  borderColor: '#fff',
                  borderWidth: 2,
                  shadowBlur: 10,
                  shadowColor: 'rgba(255, 107, 0, 0.8)'
                },
                label: {
                  show: true,
                  formatter: '{c}',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255, 107, 0, 0.8)',
                  padding: [4, 8],
                  borderRadius: 4
                }
              }))
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.9)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          textStyle: {
            color: '#00e5ff'
          },
          formatter: (params: any) => {
            const point = params[0]
            return `
              <div style="padding: 5px;">
                <strong>拉曼位移:</strong> ${point.data[0].toFixed(1)} cm⁻¹<br/>
                <strong>强度:</strong> ${point.data[1].toFixed(2)} a.u.
              </div>
            `
          }
        },
        toolbox: {
          show: activeTool.value === 'zoom',
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {}
          },
          iconStyle: {
            borderColor: '#00e5ff'
          }
        },
        dataZoom: activeTool.value === 'zoom' ? [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100,
            handleIcon: 'path://M10,10 L10,90 L90,90 L90,10 Z',
            handleStyle: {
              color: '#00e5ff'
            },
            textStyle: {
              color: '#00e5ff'
            }
          }
        ] : []
      }

      spectrumChartInstance.setOption(option)

      if (activeTool.value === 'peak') {
        spectrumChartInstance.off('click')
        spectrumChartInstance.on('click', (params: any) => {
          if (params.componentType === 'series') {
            const [x, y] = params.data
            annotations.value.push({
              x: x,
              y: y,
              label: `${x.toFixed(0)} cm⁻¹`
            })
            ElMessage.success(`已添加标注: ${x.toFixed(0)} cm⁻¹`)
            renderSpectrumChart()
          }
        })
      }
    }

    onMounted(() => {
      nextTick(() => {
        renderSpectrumChart()

        window.addEventListener('resize', () => {
          spectrumChartInstance?.resize()
        })
      })
    })

    return {
      reportConfig,
      templateOptions,
      selectedTemplate,
      reportOutline,
      chartLibrary,
      activeTool,
      annotations,
      spectrumChart,
      spectrumData,
      insertedChartsCount,
      selectTemplate,
      toggleOutlineItem,
      toggleChartInsertion,
      setActiveTool,
      captureChart,
      exportReport
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
  background: linear-gradient(135deg, #001529 0%, #000814 100%);
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
  width: 20%;
  height: 100%;
  overflow-y: auto;
}

.center-panel {
  width: 55%;
  height: 100%;
  overflow: hidden;
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

.config-form {
  margin-bottom: 24px;
}

.form-item :deep(.el-form-item__label) {
  color: #00e5ff !important;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.custom-input :deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  border-radius: 4px;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__inner:focus) {
  border-color: #00e5ff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  background: rgba(0, 229, 255, 0.08);
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: rgba(0, 229, 255, 0.4);
}

.custom-date-picker :deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
}

.custom-date-picker :deep(.el-input__prefix) {
  color: #00e5ff;
}

.template-section {
  margin-top: 24px;
}

.section-title {
  font-size: 15px;
  color: #00e5ff;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #00e5ff, #ff6b00);
  border-radius: 2px;
}

.template-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card {
  position: relative;
  padding: 16px;
  background: rgba(0, 229, 255, 0.05);
  border: 2px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.template-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
  transition: left 0.5s;
}

.template-card:hover::before {
  left: 100%;
}

.template-card:hover {
  border-color: #00e5ff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  transform: translateY(-2px);
}

.template-card.active {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.5);
}

.template-card.active .card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 8px;
  background: linear-gradient(45deg, #00e5ff, #ff6b00);
  opacity: 0.3;
  z-index: -1;
  animation: rotate-glow 3s linear infinite;
}

@keyframes rotate-glow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.card-icon {
  font-size: 32px;
  color: #00e5ff;
  margin-bottom: 8px;
}

.template-card.active .card-icon {
  color: #ff6b00;
  text-shadow: 0 0 15px rgba(255, 107, 0, 0.8);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #00e5ff;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: rgba(0, 229, 255, 0.6);
}

.chart-section {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
}

.tool-button {
  background: rgba(0, 229, 255, 0.1) !important;
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  color: #00e5ff !important;
  transition: all 0.3s;
}

.tool-button:hover {
  background: rgba(0, 229, 255, 0.2) !important;
  border-color: #00e5ff !important;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
  transform: translateY(-2px);
}

.tool-button.is-type-primary {
  background: rgba(0, 229, 255, 0.3) !important;
  border-color: #00e5ff !important;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
}

.export-btn {
  background: rgba(255, 107, 0, 0.1) !important;
  border-color: rgba(255, 107, 0, 0.5) !important;
  color: #ff6b00 !important;
}

.export-btn:hover {
  background: rgba(255, 107, 0, 0.2) !important;
  border-color: #ff6b00 !important;
  box-shadow: 0 0 12px rgba(255, 107, 0, 0.5);
}

.spectrum-chart {
  flex: 1;
  min-height: 0;
}

.annotation-tip {
  margin-top: 12px;
  padding: 10px 16px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px dashed #00e5ff;
  border-radius: 4px;
  color: #00e5ff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse-tip 2s ease-in-out infinite;
}

@keyframes pulse-tip {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.outline-section {
  margin-bottom: 24px;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.outline-item i {
  font-size: 16px;
  color: rgba(0, 229, 255, 0.5);
}

.outline-item.checked i {
  color: #00ff7f;
}

.outline-item span {
  color: rgba(0, 229, 255, 0.7);
}

.outline-item.checked span {
  color: #00e5ff;
  font-weight: 500;
}

.outline-item:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: #00e5ff;
  transform: translateX(4px);
}

.chart-library-section {
  margin-bottom: 24px;
}

.chart-library {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-tag {
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
  padding: 6px 12px;
}

.chart-tag :deep(.el-tag__content) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}

.export-section {
  margin-bottom: 20px;
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-button {
  position: relative;
  width: 100%;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
}

.pdf-button {
  background: linear-gradient(135deg, #ff6b00 0%, #ff4500 100%);
  box-shadow: 0 0 25px rgba(255, 107, 0, 0.5);
}

.pdf-button:hover {
  box-shadow: 0 0 40px rgba(255, 107, 0, 0.8);
  transform: translateY(-3px) scale(1.02);
}

.word-button {
  background: linear-gradient(135deg, #00e5ff 0%, #0099cc 100%);
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.5);
}

.word-button:hover {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.8);
  transform: translateY(-3px) scale(1.02);
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

.export-button:hover .button-glow {
  left: 100%;
}

.export-button i {
  font-size: 18px;
}

.report-stats {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.stat-item {
  flex: 1;
  padding: 12px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: rgba(0, 229, 255, 0.7);
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 20px;
  color: #ff6b00;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
}

.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: rgba(0, 21, 41, 0.3);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.4);
  border-radius: 3px;
  transition: all 0.3s;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 0, 0.6);
}

:deep(.el-date-picker) {
  background: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid #00e5ff !important;
}

:deep(.el-date-picker .el-picker-panel__body) {
  background: transparent !important;
}

:deep(.el-date-picker .el-date-table td.current:not(.disabled) span) {
  background: #00e5ff !important;
  color: #001529 !important;
}

:deep(.el-date-picker .el-date-table td.today span) {
  color: #ff6b00 !important;
  font-weight: bold;
}

:deep(.el-tag--info) {
  background: rgba(0, 229, 255, 0.2) !important;
  border-color: rgba(0, 229, 255, 0.4) !important;
  color: #00e5ff !important;
}

:deep(.el-tag--success) {
  background: rgba(0, 255, 127, 0.2) !important;
  border-color: rgba(0, 255, 127, 0.4) !important;
  color: #00ff7f !important;
}

@media (max-width: 1600px) {
  .template-card {
    padding: 12px;
  }

  .card-icon {
    font-size: 28px;
  }

  .export-button {
    padding: 12px 16px;
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
    min-height: 500px;
  }

  .template-cards {
    flex-direction: row;
  }

  .template-card {
    flex: 1;
  }
}
</style>