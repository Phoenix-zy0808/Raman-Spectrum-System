<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <!-- 左侧面板 - 报告配置与模板 -->
      <div class="left-panel">
        <dv-border-box-11>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-icon">📋</span>
              <span class="title-text">报告配置</span>
            </div>

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

            <!-- 报告模板选择 -->
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
                  <div class="card-content">
                    <div class="card-title">{{ template.name }}</div>
                    <div class="card-desc">{{ template.description }}</div>
                  </div>
                  <div class="card-glow"></div>
                </div>
              </div>
            </div>

            <!-- 内容大纲 -->
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
          </div>
        </dv-border-box-11>
      </div>

      <!-- 中央面板 - 交互式可视化 -->
      <div class="center-panel">
        <!-- 交互式光谱标注 -->
        <div class="spectrum-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">交互式光谱标注</span>
                <div class="toolbar-buttons">
                  <el-button
                    :type="activeTool === 'peak' ? 'primary' : 'default'"
                    size="small"
                    class="tool-button"
                    @click="setActiveTool('peak')"
                  >
                    <i class="el-icon-s-data"></i> 峰位标注
                  </el-button>
                  <el-button
                    :type="activeTool === 'measure' ? 'primary' : 'default'"
                    size="small"
                    class="tool-button"
                    @click="setActiveTool('measure')"
                  >
                    <i class="el-icon-s-operation"></i> 参数测量
                  </el-button>
                  <el-button
                    :type="showOverlay ? 'primary' : 'default'"
                    size="small"
                    class="tool-button"
                    @click="toggleOverlay"
                  >
                    <i class="el-icon-s-grid"></i> 光谱叠加
                  </el-button>
                  <el-button
                    size="small"
                    class="tool-button capture-btn"
                    @click="captureChart"
                  >
                    <i class="el-icon-camera"></i> 截图
                  </el-button>
                </div>
              </div>

              <div ref="spectrumChart" class="spectrum-chart"></div>

              <div class="measurement-panel" v-if="selectedPeak">
                <div class="measurement-title">测量结果</div>
                <div class="measurement-grid">
                  <div class="measurement-item">
                    <span class="measure-label">峰位:</span>
                    <span class="measure-value">{{ selectedPeak.position }} cm⁻¹</span>
                  </div>
                  <div class="measurement-item">
                    <span class="measure-label">峰强:</span>
                    <span class="measure-value">{{ selectedPeak.intensity }} a.u.</span>
                  </div>
                  <div class="measurement-item">
                    <span class="measure-label">峰面积:</span>
                    <span class="measure-value">{{ selectedPeak.area }} a.u.·cm⁻¹</span>
                  </div>
                  <div class="measurement-item">
                    <span class="measure-label">半高宽:</span>
                    <span class="measure-value">{{ selectedPeak.fwhm }} cm⁻¹</span>
                  </div>
                </div>
              </div>

              <div class="annotation-tip" v-if="activeTool === 'peak'">
                <i class="el-icon-info"></i>
                点击光谱曲线添加峰位标注
              </div>
            </div>
          </dv-border-box-13>
        </div>

        <!-- 化学成像可视化 -->
        <div class="imaging-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">化学成像可视化</span>
                <div class="imaging-controls">
                  <el-select v-model="colorMapScheme" size="small" class="colormap-select">
                    <el-option label="热力图 (Hot)" value="hot" />
                    <el-option label="彩虹 (Jet)" value="jet" />
                    <el-option label="蓝绿 (Viridis)" value="viridis" />
                    <el-option label="灰度 (Gray)" value="gray" />
                  </el-select>
                  <el-button
                    :type="view3D ? 'primary' : 'default'"
                    size="small"
                    class="tool-button"
                    @click="toggle3DView"
                  >
                    <i class="el-icon-data-analysis"></i> {{ view3D ? '3D视图' : '2D视图' }}
                  </el-button>
                  <el-button
                    size="small"
                    class="tool-button"
                    @click="calculateRegionStats"
                  >
                    <i class="el-icon-s-data"></i> 区域统计
                  </el-button>
                </div>
              </div>

              <div class="imaging-container">
                <div ref="imagingChart" class="imaging-chart"></div>

                <!-- 区域统计结果 -->
                <div class="region-stats" v-if="regionStats">
                  <div class="stats-title">区域统计</div>
                  <div class="stats-grid">
                    <div class="stats-item">
                      <span class="stats-label">平均值:</span>
                      <span class="stats-value">{{ regionStats.mean }}</span>
                    </div>
                    <div class="stats-item">
                      <span class="stats-label">标准差:</span>
                      <span class="stats-value">{{ regionStats.std }}</span>
                    </div>
                    <div class="stats-item">
                      <span class="stats-label">最大值:</span>
                      <span class="stats-value">{{ regionStats.max }}</span>
                    </div>
                    <div class="stats-item">
                      <span class="stats-label">最小值:</span>
                      <span class="stats-value">{{ regionStats.min }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dv-border-box-13>
        </div>
      </div>

      <!-- 右侧面板 - 图表库与导出 -->
      <div class="right-panel">
        <dv-border-box-11>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-icon">📊</span>
              <span class="title-text">报告生成器</span>
            </div>

            <!-- 图表库 -->
            <div class="chart-library-section">
              <h3 class="section-title">图表库</h3>
              <div class="chart-library">
                <div
                  v-for="chart in chartLibrary"
                  :key="chart.id"
                  class="chart-card"
                  :class="{ inserted: chart.inserted }"
                  @click="toggleChartInsertion(chart.id)"
                >
                  <div class="chart-preview">
                    <i :class="chart.icon"></i>
                  </div>
                  <div class="chart-info">
                    <div class="chart-name">{{ chart.name }}</div>
                    <div class="chart-status">
                      <i :class="chart.inserted ? 'el-icon-check' : 'el-icon-plus'"></i>
                      {{ chart.inserted ? '已插入' : '点击插入' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标注列表 -->
            <div class="annotations-section">
              <h3 class="section-title">
                标注列表
                <el-button
                  size="mini"
                  type="text"
                  @click="clearAnnotations"
                  class="clear-btn"
                >
                  清空
                </el-button>
              </h3>
              <div class="annotations-list">
                <div
                  v-for="(annotation, index) in annotations"
                  :key="index"
                  class="annotation-item"
                >
                  <span class="annotation-index">{{ index + 1 }}</span>
                  <span class="annotation-text">{{ annotation.label }}</span>
                  <i class="el-icon-delete delete-icon" @click="deleteAnnotation(index)"></i>
                </div>
                <div v-if="annotations.length === 0" class="empty-hint">
                  暂无标注
                </div>
              </div>
            </div>

            <!-- 导出设置 -->
            <div class="export-section">
              <h3 class="section-title">导出设置</h3>
              <div class="export-options">
                <el-checkbox v-model="exportOptions.includeCharts">包含图表</el-checkbox>
                <el-checkbox v-model="exportOptions.includeAnnotations">包含标注</el-checkbox>
                <el-checkbox v-model="exportOptions.includeStats">包含统计</el-checkbox>
              </div>
            </div>

            <!-- 导出按钮 -->
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

            <!-- 统计信息 -->
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">标注数量</span>
                <span class="stat-value">{{ annotations.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">插入图表</span>
                <span class="stat-value">{{ insertedChartsCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成度</span>
                <span class="stat-value">{{ completionRate }}%</span>
              </div>
            </div>
          </div>
        </dv-border-box-11>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import NavBar from '@/components/NavBar.vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'ReportGenerator',
  components: {
    NavBar
  },
  setup() {
    // 报告配置
    const reportConfig = ref({
      experimentName: '苯系物混合样品拉曼光谱分析',
      operator: '张研究员',
      experimentDate: new Date()
    })

    // 模板选项
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

    // 报告大纲
    const reportOutline = ref([
      { title: '1. 实验目的与背景', included: true },
      { title: '2. 拉曼光谱图', included: true },
      { title: '3. 峰位分析', included: true },
      { title: '4. 化学成像', included: true },
      { title: '5. 定量分析结果', included: true },
      { title: '6. 统计学分析', included: true },
      { title: '7. 结论与建议', included: true }
    ])

    // 图表库
    const chartLibrary = ref([
      { id: 'spectrum', name: '拉曼光谱', icon: 'el-icon-data-line', inserted: false },
      { id: '3d-imaging', name: '3D成像图', icon: 'el-icon-picture-outline', inserted: false },
      { id: 'heatmap', name: '热力图', icon: 'el-icon-s-marketing', inserted: false },
      { id: 'pca-scatter', name: 'PCA散点图', icon: 'el-icon-s-data', inserted: false },
      { id: 'calibration', name: '标准曲线', icon: 'el-icon-trend-charts', inserted: false },
      { id: 'comparison', name: '光谱对比', icon: 'el-icon-data-analysis', inserted: false }
    ])

    // 工具状态
    const activeTool = ref('peak')
    const showOverlay = ref(false)
    const view3D = ref(false)
    const colorMapScheme = ref('hot')

    // 标注和测量
    const annotations = ref<Array<{ x: number; y: number; label: string }>>([])
    const selectedPeak = ref<any>(null)
    const regionStats = ref<any>(null)

    // 导出选项
    const exportOptions = ref({
      includeCharts: true,
      includeAnnotations: true,
      includeStats: true
    })

    // 图表实例
    const spectrumChart = ref<HTMLElement | null>(null)
    const imagingChart = ref<HTMLElement | null>(null)
    let spectrumChartInstance: ECharts | null = null
    let imagingChartInstance: ECharts | null = null

    // 生成光谱数据
    const generateSpectrumData = (offset = 0) => {
      const data: Array<[number, number]> = []
      for (let i = 400; i <= 2000; i += 2) {
        let intensity = Math.random() * 80 + 50 + offset

        // 特征峰
        if (Math.abs(i - 1002) < 10) intensity += 800 * Math.exp(-Math.pow((i - 1002) / 5, 2))
        if (Math.abs(i - 1030) < 10) intensity += 500 * Math.exp(-Math.pow((i - 1030) / 5, 2))
        if (Math.abs(i - 1155) < 10) intensity += 600 * Math.exp(-Math.pow((i - 1155) / 5, 2))
        if (Math.abs(i - 1600) < 10) intensity += 700 * Math.exp(-Math.pow((i - 1600) / 5, 2))

        data.push([i, intensity])
      }
      return data
    }

    const spectrumData = ref(generateSpectrumData())
    const overlayData = ref(generateSpectrumData(50))

    // 生成化学成像数据
    const generateImagingData = () => {
      const data: Array<[number, number, number]> = []
      for (let i = 0; i < 60; i++) {
        for (let j = 0; j < 60; j++) {
          const value =
            Math.sin(i / 8) * Math.cos(j / 8) * 50 +
            Math.sin((i + j) / 10) * 30 +
            50 +
            Math.random() * 20
          data.push([i, j, Math.max(0, value)])
        }
      }
      return data
    }

    // 计算属性
    const insertedChartsCount = computed(() => {
      return chartLibrary.value.filter(chart => chart.inserted).length
    })

    const completionRate = computed(() => {
      const totalItems = reportOutline.value.length
      const includedItems = reportOutline.value.filter(item => item.included).length
      const chartRatio = insertedChartsCount.value / chartLibrary.value.length
      return Math.round((includedItems / totalItems * 0.6 + chartRatio * 0.4) * 100)
    })

    // 选择模板
    const selectTemplate = (templateId: string) => {
      selectedTemplate.value = templateId
      const template = templateOptions.value.find(t => t.id === templateId)
      if (template) {
        ElMessage.success(`已切换到 ${template.name}`)
      }
    }

    // 切换大纲项目
    const toggleOutlineItem = (index: number) => {
      reportOutline.value[index].included = !reportOutline.value[index].included
    }

    // 切换图表插入状态
    const toggleChartInsertion = (chartId: string) => {
      const chart = chartLibrary.value.find(c => c.id === chartId)
      if (chart) {
        chart.inserted = !chart.inserted
        const action = chart.inserted ? '已添加到报告' : '已从报告移除'
        ElMessage.info(`${chart.name} ${action}`)
      }
    }

    // 设置活动工具
    const setActiveTool = (tool: string) => {
      activeTool.value = tool
      if (tool === 'measure') {
        ElMessage.info('参数测量模式已开启，点击峰位查看详细参数')
      }
      renderSpectrumChart()
    }

    // 切换光谱叠加
    const toggleOverlay = () => {
      showOverlay.value = !showOverlay.value
      renderSpectrumChart()
      const status = showOverlay.value ? '已开启' : '已关闭'
      ElMessage.info(`光谱叠加 ${status}`)
    }

    // 切换3D视图
    const toggle3DView = () => {
      view3D.value = !view3D.value
      renderImagingChart()
      const mode = view3D.value ? '3D体渲染' : '2D热力图'
      ElMessage.info(`已切换到 ${mode}`)
    }

    // 计算区域统计
    const calculateRegionStats = () => {
      regionStats.value = {
        mean: (Math.random() * 50 + 50).toFixed(2),
        std: (Math.random() * 10 + 5).toFixed(2),
        max: (Math.random() * 20 + 80).toFixed(2),
        min: (Math.random() * 20 + 20).toFixed(2)
      }
      ElMessage.success('区域统计计算完成')
    }

    // 截图到报告
    const captureChart = () => {
      chartLibrary.value[0].inserted = true
      ElMessage.success('光谱图已保存到报告')
    }

    // 清空标注
    const clearAnnotations = () => {
      annotations.value = []
      selectedPeak.value = null
      renderSpectrumChart()
      ElMessage.info('已清空所有标注')
    }

    // 删除标注
    const deleteAnnotation = (index: number) => {
      annotations.value.splice(index, 1)
      renderSpectrumChart()
    }

    // 导出报告
    const exportReport = (format: string) => {
      const formatName = format === 'pdf' ? 'PDF' : 'Word'

      const loadingMsg = ElMessage({
        message: `正在生成 ${formatName} 报告...`,
        type: 'info',
        duration: 0
      })

      setTimeout(() => {
        loadingMsg.close()
        ElMessage.success(`${formatName} 报告生成成功！`)
      }, 2000)
    }

    // 渲染光谱图表
    const renderSpectrumChart = () => {
      if (!spectrumChart.value) return

      if (!spectrumChartInstance) {
        spectrumChartInstance = echarts.init(spectrumChart.value)
      }

      const series: any[] = [
        {
          name: '主光谱',
          type: 'line',
          data: spectrumData.value,
          smooth: true,
          lineStyle: {
            color: '#00e5ff',
            width: 3,
            shadowBlur: 12,
            shadowColor: 'rgba(0, 229, 255, 0.6)'
          },
          itemStyle: {
            color: '#00e5ff'
          },
          showSymbol: false,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 229, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 229, 255, 0.05)' }
            ])
          },
          markPoint: {
            data: annotations.value.map(ann => ({
              coord: [ann.x, ann.y],
              value: ann.label,
              itemStyle: {
                color: '#ff6b00',
                borderColor: '#fff',
                borderWidth: 2,
                shadowBlur: 12,
                shadowColor: 'rgba(255, 107, 0, 0.8)'
              },
              label: {
                show: true,
                formatter: '{c}',
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 107, 0, 0.9)',
                padding: [5, 10],
                borderRadius: 4
              }
            }))
          }
        }
      ]

      if (showOverlay.value) {
        series.push({
          name: '对比光谱',
          type: 'line',
          data: overlayData.value,
          smooth: true,
          lineStyle: {
            color: '#00ff7f',
            width: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 255, 127, 0.5)'
          },
          showSymbol: false
        })
      }

      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '8%',
          right: '5%',
          top: '12%',
          bottom: '15%'
        },
        legend: showOverlay.value ? {
          data: ['主光谱', '对比光谱'],
          top: 10,
          right: 20,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13,
            fontWeight: 'bold'
          }
        } : undefined,
        xAxis: {
          type: 'value',
          name: '拉曼位移 (cm⁻¹)',
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 14,
            fontWeight: 'bold'
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff',
              width: 2
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.15)',
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '强度 (a.u.)',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 14,
            fontWeight: 'bold'
          },
          axisLine: {
            lineStyle: {
              color: '#00e5ff',
              width: 2
            }
          },
          axisLabel: {
            color: '#00e5ff',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.15)',
              type: 'dashed'
            }
          }
        },
        series: series,
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.95)',
          borderColor: '#00e5ff',
          borderWidth: 2,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13
          },
          formatter: (params: any) => {
            let html = '<div style="padding: 8px;">'
            params.forEach((param: any) => {
              html += `
                <div style="margin-bottom: 5px;">
                  <span style="color: ${param.color}; font-weight: bold;">${param.seriesName}:</span><br/>
                  <span style="color: #00ff7f;">位移:</span> ${param.data[0].toFixed(1)} cm⁻¹<br/>
                  <span style="color: #00ff7f;">强度:</span> ${param.data[1].toFixed(2)} a.u.
                </div>
              `
            })
            html += '</div>'
            return html
          }
        }
      }

      spectrumChartInstance.setOption(option)

      // 点击事件
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
      } else if (activeTool.value === 'measure') {
        spectrumChartInstance.off('click')
        spectrumChartInstance.on('click', (params: any) => {
          if (params.componentType === 'series') {
            const [x, y] = params.data
            selectedPeak.value = {
              position: x.toFixed(1),
              intensity: y.toFixed(2),
              area: (y * 12.5).toFixed(2),
              fwhm: (8 + Math.random() * 4).toFixed(1)
            }
          }
        })
      }
    }

    // 渲染化学成像图表
    const renderImagingChart = () => {
      if (!imagingChart.value) return

      if (!imagingChartInstance) {
        imagingChartInstance = echarts.init(imagingChart.value)
      }

      const imagingData = generateImagingData()

      if (view3D.value) {
        // 3D体渲染
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            backgroundColor: 'rgba(0, 21, 41, 0.95)',
            borderColor: '#00e5ff',
            borderWidth: 2,
            textStyle: { color: '#00e5ff', fontSize: 13 }
          },
          visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'vertical',
            right: '3%',
            top: 'center',
            textStyle: { color: '#00e5ff', fontSize: 11 },
            inRange: {
              color: getColorScheme(colorMapScheme.value)
            }
          },
          xAxis3D: {
            type: 'value',
            name: 'X',
            nameTextStyle: { color: '#00e5ff' },
            axisLine: { lineStyle: { color: '#00e5ff' } },
            axisLabel: { color: '#00e5ff', fontSize: 10 }
          },
          yAxis3D: {
            type: 'value',
            name: 'Y',
            nameTextStyle: { color: '#00e5ff' },
            axisLine: { lineStyle: { color: '#00e5ff' } },
            axisLabel: { color: '#00e5ff', fontSize: 10 }
          },
          zAxis3D: {
            type: 'value',
            name: '强度',
            nameTextStyle: { color: '#00e5ff' },
            axisLine: { lineStyle: { color: '#00e5ff' } },
            axisLabel: { color: '#00e5ff', fontSize: 10 }
          },
          grid3D: {
            boxWidth: 100,
            boxDepth: 100,
            boxHeight: 80,
            viewControl: {
              autoRotate: true,
              autoRotateSpeed: 5
            },
            light: {
              main: {
                intensity: 1.2,
                shadow: true
              },
              ambient: {
                intensity: 0.3
              }
            }
          },
          series: [
            {
              type: 'scatter3D',
              data: imagingData,
              symbolSize: 3,
              itemStyle: {
                opacity: 0.8
              }
            }
          ]
        }
        imagingChartInstance.setOption(option)
      } else {
        // 2D热力图
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            position: 'top',
            backgroundColor: 'rgba(0, 21, 41, 0.95)',
            borderColor: '#00e5ff',
            borderWidth: 2,
            textStyle: { color: '#00e5ff', fontSize: 13 },
            formatter: (params: any) => {
              return `
                <div style="padding: 8px;">
                  <div style="color: #00ff7f; font-weight: bold; margin-bottom: 5px;">
                    位置: (${params.data[0]}, ${params.data[1]})
                  </div>
                  <div style="color: #00e5ff;">
                    强度: ${params.data[2].toFixed(2)}
                  </div>
                </div>
              `
            }
          },
          grid: {
            left: '5%',
            right: '18%',
            top: '5%',
            bottom: '5%'
          },
          xAxis: {
            type: 'category',
            data: Array.from({ length: 60 }, (_, i) => i),
            splitArea: { show: true },
            axisLine: { lineStyle: { color: '#00e5ff' } },
            axisLabel: { show: false }
          },
          yAxis: {
            type: 'category',
            data: Array.from({ length: 60 }, (_, i) => i),
            splitArea: { show: true },
            axisLine: { lineStyle: { color: '#00e5ff' } },
            axisLabel: { show: false }
          },
          visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: 'vertical',
            right: '0%',
            top: 'center',
            textStyle: { color: '#00e5ff', fontSize: 11 },
            inRange: {
              color: getColorScheme(colorMapScheme.value)
            }
          },
          series: [
            {
              type: 'heatmap',
              data: imagingData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: '#00e5ff'
                }
              }
            }
          ]
        }
        imagingChartInstance.setOption(option)
      }
    }

    // 获取颜色方案
    const getColorScheme = (scheme: string) => {
      const schemes: Record<string, string[]> = {
        hot: ['#000000', '#ff0000', '#ffff00', '#ffffff'],
        jet: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
        viridis: ['#440154', '#31688e', '#35b779', '#fde724'],
        gray: ['#000000', '#ffffff']
      }
      return schemes[scheme] || schemes.hot
    }

    // 窗口resize处理
    const handleResize = () => {
      spectrumChartInstance?.resize()
      imagingChartInstance?.resize()
    }

    onMounted(() => {
      nextTick(() => {
        renderSpectrumChart()
        renderImagingChart()
        window.addEventListener('resize', handleResize)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      spectrumChartInstance?.dispose()
      imagingChartInstance?.dispose()
    })

    return {
      reportConfig,
      templateOptions,
      selectedTemplate,
      reportOutline,
      chartLibrary,
      activeTool,
      showOverlay,
      view3D,
      colorMapScheme,
      annotations,
      selectedPeak,
      regionStats,
      exportOptions,
      spectrumChart,
      imagingChart,
      insertedChartsCount,
      completionRate,
      selectTemplate,
      toggleOutlineItem,
      toggleChartInsertion,
      setActiveTool,
      toggleOverlay,
      toggle3DView,
      calculateRegionStats,
      captureChart,
      clearAnnotations,
      deleteAnnotation,
      exportReport
    }
  }
})
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #001529 0%, #000814 100%);
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
      linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  min-height: 0;
}

// ========== 左侧面板 ==========
.left-panel {
  width: 22%;
  min-width: 300px;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 21, 41, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 0, 0.6);
    }
  }
}

.panel-content {
  padding: 20px;
  height: 100%;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 229, 255, 0.4);

  .title-icon {
    font-size: 22px;
    filter: drop-shadow(0 0 8px #00e5ff);
    margin-right: 8px;
  }

  .title-text {
    font-size: 18px;
    font-weight: bold;
    color: #00e5ff;
    text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
    letter-spacing: 2px;
  }

  .toolbar-buttons,
  .imaging-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.config-form {
  margin-bottom: 24px;

  :deep(.el-form-item__label) {
    color: #00e5ff !important;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}

.custom-input,
.custom-date-picker {
  :deep(.el-input__inner) {
    background: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
    border-radius: 6px;
    transition: all 0.3s;

    &:focus {
      border-color: #00e5ff;
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
      background: rgba(0, 229, 255, 0.12);
    }

    &::placeholder {
      color: rgba(0, 229, 255, 0.4);
    }
  }

  :deep(.el-input__prefix) {
    color: #00e5ff;
  }
}

.section-title {
  font-size: 15px;
  color: #00e5ff;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #00e5ff, #ff6b00);
    border-radius: 2px;
  }

  .clear-btn {
    color: #ff6b00;
    font-size: 12px;
    padding: 0;

    &:hover {
      color: #ff8800;
    }
  }
}

// 模板卡片
.template-section {
  margin-bottom: 24px;
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
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    border-color: #00e5ff;
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(0, 229, 255, 0.15);
    border-color: #00e5ff;
    box-shadow: 0 0 30px rgba(0, 229, 255, 0.5);

    .card-icon {
      color: #ff6b00;
      text-shadow: 0 0 15px rgba(255, 107, 0, 0.8);
    }

    .card-glow {
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
  }

  .card-icon {
    font-size: 32px;
    color: #00e5ff;
    transition: all 0.3s;
  }

  .card-content {
    flex: 1;
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
}

@keyframes rotate-glow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

// 大纲列表
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
  padding: 10px 14px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;

  i {
    font-size: 16px;
    color: rgba(0, 229, 255, 0.5);
  }

  span {
    color: rgba(0, 229, 255, 0.7);
  }

  &.checked {
    i {
      color: #00ff7f;
      text-shadow: 0 0 8px rgba(0, 255, 127, 0.6);
    }

    span {
      color: #00e5ff;
      font-weight: 500;
    }
  }

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    border-color: #00e5ff;
    transform: translateX(4px);
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
  }
}

// ========== 中央面板 ==========
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.spectrum-section {
  flex: 1 1 55%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.imaging-section {
  flex: 1 1 45%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tool-button {
  background: rgba(0, 229, 255, 0.1) !important;
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  color: #00e5ff !important;
  transition: all 0.3s;
  font-size: 13px;

  &:hover {
    background: rgba(0, 229, 255, 0.2) !important;
    border-color: #00e5ff !important;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
    transform: translateY(-1px);
  }

  &.is-type-primary {
    background: rgba(0, 229, 255, 0.3) !important;
    border-color: #00e5ff !important;
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
  }

  &.capture-btn {
    background: rgba(255, 107, 0, 0.1) !important;
    border-color: rgba(255, 107, 0, 0.5) !important;
    color: #ff6b00 !important;

    &:hover {
      background: rgba(255, 107, 0, 0.2) !important;
      border-color: #ff6b00 !important;
      box-shadow: 0 0 12px rgba(255, 107, 0, 0.5);
    }
  }
}

.colormap-select {
  :deep(.el-input__inner) {
    background: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
    font-size: 13px;
  }
}

.spectrum-chart {
  flex: 1;
  min-height: 0;
}

.imaging-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.imaging-chart {
  flex: 1;
  min-height: 0;
}

.measurement-panel {
  margin-top: 12px;
  padding: 16px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;

  .measurement-title {
    font-size: 14px;
    font-weight: bold;
    color: #00e5ff;
    margin-bottom: 12px;
    text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  }

  .measurement-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .measurement-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 21, 41, 0.5);
    border-radius: 6px;

    .measure-label {
      color: rgba(0, 229, 255, 0.7);
      font-size: 12px;
    }

    .measure-value {
      color: #00ff7f;
      font-size: 13px;
      font-weight: bold;
      text-shadow: 0 0 8px rgba(0, 255, 127, 0.5);
    }
  }
}

.region-stats {
  margin-top: 12px;
  padding: 16px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;

  .stats-title {
    font-size: 14px;
    font-weight: bold;
    color: #00e5ff;
    margin-bottom: 12px;
    text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stats-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 21, 41, 0.5);
    border-radius: 6px;

    .stats-label {
      color: rgba(0, 229, 255, 0.7);
      font-size: 12px;
    }

    .stats-value {
      color: #00ff7f;
      font-size: 13px;
      font-weight: bold;
      text-shadow: 0 0 8px rgba(0, 255, 127, 0.5);
    }
  }
}

.annotation-tip {
  margin-top: 12px;
  padding: 10px 16px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px dashed #00e5ff;
  border-radius: 6px;
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

// ========== 右侧面板 ==========
.right-panel {
  width: 26%;
  min-width: 300px;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 21, 41, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 107, 0, 0.6);
    }
  }
}

// 图表库
.chart-library-section {
  margin-bottom: 24px;
}

.chart-library {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chart-card {
  padding: 12px;
  background: rgba(0, 229, 255, 0.05);
  border: 2px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;

  &:hover {
    border-color: #00e5ff;
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
    transform: translateY(-2px);
  }

  &.inserted {
    background: rgba(0, 255, 127, 0.1);
    border-color: #00ff7f;
    box-shadow: 0 0 15px rgba(0, 255, 127, 0.4);
  }

  .chart-preview {
    font-size: 32px;
    color: #00e5ff;
    margin-bottom: 8px;
  }

  &.inserted .chart-preview {
    color: #00ff7f;
  }

  .chart-info {
    .chart-name {
      font-size: 13px;
      font-weight: 600;
      color: #00e5ff;
      margin-bottom: 4px;
    }

    .chart-status {
      font-size: 11px;
      color: rgba(0, 229, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  }

  &.inserted .chart-info .chart-status {
    color: #00ff7f;
  }
}

// 标注列表
.annotations-section {
  margin-bottom: 24px;
}

.annotations-list {
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 255, 0.3);
    border-radius: 3px;
  }

  .annotation-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 229, 255, 0.1);
      border-color: #00e5ff;

      .delete-icon {
        opacity: 1;
      }
    }

    .annotation-index {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #ff6b00;
      color: #fff;
      border-radius: 50%;
      font-size: 11px;
      font-weight: bold;
    }

    .annotation-text {
      flex: 1;
      color: #00e5ff;
      font-size: 13px;
    }

    .delete-icon {
      color: #ff6b00;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.3s;

      &:hover {
        color: #ff0000;
        transform: scale(1.2);
      }
    }
  }

  .empty-hint {
    text-align: center;
    color: rgba(0, 229, 255, 0.5);
    font-size: 12px;
    padding: 20px;
  }
}

// 导出设置
.export-section {
  margin-bottom: 20px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 10px;

  :deep(.el-checkbox) {
    color: #00e5ff;

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #00e5ff;
      border-color: #00e5ff;
    }

    .el-checkbox__label {
      color: #00e5ff;
      font-size: 13px;
    }
  }
}

// 导出按钮
.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
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

  &.pdf-button {
    background: linear-gradient(135deg, #ff6b00 0%, #ff4500 100%);
    box-shadow: 0 0 25px rgba(255, 107, 0, 0.5);

    &:hover {
      box-shadow: 0 0 40px rgba(255, 107, 0, 0.8);
      transform: translateY(-3px) scale(1.02);
    }
  }

  &.word-button {
    background: linear-gradient(135deg, #00e5ff 0%, #0099cc 100%);
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.5);

    &:hover {
      box-shadow: 0 0 40px rgba(0, 229, 255, 0.8);
      transform: translateY(-3px) scale(1.02);
    }
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

  &:hover .button-glow {
    left: 100%;
  }

  i {
    font-size: 18px;
  }
}

// 统计信息
.report-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  padding: 12px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 6px;
  text-align: center;

  .stat-label {
    display: block;
    font-size: 11px;
    color: rgba(0, 229, 255, 0.7);
    margin-bottom: 6px;
  }

  .stat-value {
    display: block;
    font-size: 20px;
    color: #ff6b00;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1600px) {
  .chart-library {
    grid-template-columns: 1fr;
  }

  .report-stats {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100% !important;
    height: auto;
    min-height: 500px;
  }
}
</style>