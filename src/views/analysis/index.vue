<template>
  <div class="page-container">
    <NavBar />

    <div class="spectral-analysis-center">
      <!-- 左侧边栏 -->
      <div class="left-panel">
        <DvBorderBox13>
          <div class="panel-content">
            <!-- 搜索框 -->
            <div class="search-bar">
              <el-input
                v-model="searchKeyword"
                placeholder="请输入文件夹名称"
                class="glow-input"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button class="add-btn" circle>
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>

            <!-- 数据导入按钮 -->
            <el-button class="import-btn">
              <el-icon><Monitor /></el-icon>
              <span>数据导入</span>
            </el-button>

            <!-- 文件树 -->
            <div class="tree-container">
              <ElTree
                :data="sampleTreeData"
                :props="{ children: 'children', label: 'label' }"
                node-key="id"
                default-expand-all
                @node-click="handleNodeClick"
                class="sample-tree"
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <el-icon v-if="data.type === 'folder'" class="node-icon folder">
                      <FolderOpened v-if="node.expanded" />
                      <Folder v-else />
                    </el-icon>
                    <el-icon v-else class="node-icon file"><Document /></el-icon>
                    <span class="node-label" :class="{ active: selectedNode === data.id }">
                      {{ node.label }}
                    </span>
                  </span>
                </template>
              </ElTree>
            </div>
          </div>
        </DvBorderBox13>
      </div>

      <!-- 右侧主内容区 -->
      <div class="main-content">

        <!-- ① 拉曼光谱卡片 -->
        <div class="card spectrum-card">
          <DvBorderBox13>
            <div class="card-inner">
              <div class="card-header">
                <div class="card-title">
                  <span class="title-icon">📈</span>
                  <span>拉曼光谱</span>
                </div>
              </div>
              <div class="chart-wrapper">
                <div ref="ramanChartRef" class="raman-chart"></div>
              </div>
            </div>
          </DvBorderBox13>
        </div>

        <!-- ② 官能团匹配卡片 -->
        <div class="card matching-card">
          <DvBorderBox13>
            <div class="card-inner">

              <!-- 头部：标题 + 提示(单行不换行) + 操作按钮 -->
              <div class="matching-header">
                <div class="matching-title-group">
                  <div class="card-title">
                    <span class="title-icon">📊</span>
                    <span>官能团匹配</span>
                  </div>
                  <span class="matching-hint">
                    该数据官能团分析根据峰位特征区与指纹区进行大致的信息推断，需要结合您的样品信息进行择优选取
                  </span>
                </div>
                <div class="matching-actions">
                  <button class="secondary-btn">新增峰位</button>
                  <button class="primary-action-btn">
                    <el-icon><InfoFilled /></el-icon>
                    导出数据
                  </button>
                </div>
              </div>

              <!-- 内容：左列表格 + 右列元素选择 -->
              <div class="matching-content">

                <!-- 左列：峰位表格 -->
                <div class="table-col">
                  <div class="peak-table">
                    <div class="table-header">
                      <div class="th">序号</div>
                      <div class="th">峰位 (cm⁻¹)</div>
                      <div class="th"></div>
                      <div class="th">振动类型</div>
                    </div>
                    <div class="table-body">
                      <template v-for="(peak, pIdx) in peakData" :key="pIdx">
                        <div
                          v-for="(vib, vIdx) in peak.vibrations"
                          :key="vIdx"
                          class="table-row"
                          :class="{ 'group-last': vIdx === peak.vibrations.length - 1 }"
                        >
                          <div class="td td-index">
                            <span v-if="vIdx === 0">{{ peak.index }}</span>
                          </div>
                          <div class="td td-peak">
                            <span v-if="vIdx === 0" class="peak-value">{{ peak.peak }}</span>
                            <el-icon v-if="vIdx === 0" class="icon-del"><Delete /></el-icon>
                          </div>
                          <div class="td td-check">
                            <div
                              class="cyber-checkbox"
                              :class="{ checked: vib.checked }"
                              @click="vib.checked = !vib.checked"
                            >
                              <span v-if="vib.checked" class="check-mark">✓</span>
                            </div>
                          </div>
                          <div class="td td-vibration">
                            <span class="vib-text">{{ vib.type }}</span>
                            <el-icon class="icon-del"><Delete /></el-icon>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- 右列：元素选择 -->
                <div class="element-col">
                  <div class="element-picker">
                    <div class="picker-header">
                      <span class="picker-title">元素选择</span>
                      <div class="picker-actions">
                        <button class="picker-btn" @click="selectAllElements">全选</button>
                        <button class="picker-btn" @click="clearAllElements">清空</button>
                      </div>
                    </div>
                    <div class="element-grid">
                      <div
                        v-for="el in elements"
                        :key="el.symbol"
                        class="element-cell"
                        :class="{ selected: el.selected }"
                        @click="el.selected = !el.selected"
                      >
                        <span class="el-symbol">{{ el.symbol }}</span>
                        <div class="el-dot" :class="{ checked: el.selected }"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </DvBorderBox13>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import NavBar from '@/components/NavBar.vue'
import {
  Search, Plus, Monitor, FolderOpened, Folder,
  Document, Delete, InfoFilled
} from '@element-plus/icons-vue'

// ─────────────────────── 状态 ───────────────────────
const searchKeyword = ref('')
const selectedNode  = ref('1-1')

const sampleTreeData = ref([
  {
    id: '1', label: '默认分组', type: 'folder',
    children: [
      { id: '1-1', label: '聚苯乙烯标...', type: 'file' },
      { id: '1-2', label: '聚苯乙烯标...', type: 'file' },
    ]
  },
  {
    id: '2', label: '常用方案', type: 'folder',
    children: [
      { id: '2-1', label: '标准汽油样本', type: 'file' },
      { id: '2-2', label: '柴油混合物',   type: 'file' },
    ]
  }
])

const peakData = ref([
  {
    index: 1, peak: '3059.10',
    vibrations: [
      { type: '铵根伸缩振动', checked: true },
      { type: 'O-H伸缩振动', checked: true },
      { type: '氢键',        checked: true },
      { type: 'C-H伸缩振动', checked: true },
      { type: 'O-H伸缩振动', checked: true },
    ]
  },
  {
    index: 2, peak: '3028.24',
    vibrations: [
      { type: '氢键',        checked: true },
      { type: 'C-H伸缩振动', checked: true },
      { type: 'O-H伸缩振动', checked: true },
    ]
  },
  {
    index: 3, peak: '3001.24',
    vibrations: [
      { type: '氢键',        checked: true },
      { type: 'C-H伸缩振动', checked: true },
      { type: 'O-H伸缩振动', checked: true },
    ]
  },
  {
    index: 4, peak: '2910.58',
    vibrations: [
      { type: 'C-H伸缩振动', checked: true },
      { type: 'C-H伸缩振动', checked: true },
    ]
  },
  {
    index: 5, peak: '2848.86',
    vibrations: [
      { type: 'C-H伸缩振动', checked: true },
      { type: 'O-H伸缩振动', checked: true },
    ]
  },
  {
    index: 6, peak: '2630.91',
    vibrations: [
      { type: 'O-H伸缩振动', checked: true },
    ]
  },
  {
    index: 7, peak: '2075.41',
    vibrations: [
      { type: 'CN-', checked: true },
    ]
  },
])

const elements = ref([
  { symbol: 'C',  selected: true  },
  { symbol: 'O',  selected: true  },
  { symbol: 'H',  selected: true  },
  { symbol: 'N',  selected: false },
  { symbol: 'S',  selected: false },
  { symbol: 'P',  selected: false },
  { symbol: 'Si', selected: false },
  { symbol: 'Cr', selected: false },
  { symbol: 'Mn', selected: false },
  { symbol: 'F',  selected: false },
  { symbol: 'Cl', selected: false },
  { symbol: 'Br', selected: false },
  { symbol: 'I',  selected: false },
  { symbol: 'Al', selected: false },
  { symbol: 'Ti', selected: false },
  { symbol: 'Zn', selected: false },
  { symbol: 'Fe', selected: false },
])

// ─────────────────────── 操作 ───────────────────────
const selectAllElements = () => elements.value.forEach(e => e.selected = true)
const clearAllElements  = () => elements.value.forEach(e => e.selected = false)
const handleNodeClick   = (data: any) => { if (data.type === 'file') selectedNode.value = data.id }

// ─────────────────────── 图表 ───────────────────────
const ramanChartRef = ref<HTMLElement>()
let ramanChart: ECharts | null = null

/** 生成拉曼光谱数据（聚苯乙烯，吸收峰向下） */
const generateRamanData = (): [number, number][] => {
  const peaks = [
    { pos: 3059, h: 65, w: 25 }, { pos: 3028, h: 55, w: 20 },
    { pos: 2910, h: 50, w: 30 }, { pos: 2848, h: 40, w: 25 },
    { pos: 2630, h: 30, w: 40 }, { pos: 2075, h: 35, w: 30 },
    { pos: 1803, h: 25, w: 20 }, { pos: 1747, h: 28, w: 18 },
    { pos: 1600, h: 55, w: 22 }, { pos: 1541, h: 38, w: 18 },
    { pos: 1450, h: 45, w: 20 }, { pos: 1371, h: 32, w: 15 },
    { pos: 1325, h: 28, w: 15 }, { pos: 1244, h: 50, w: 18 },
    { pos: 1160, h: 40, w: 15 }, { pos: 1095, h: 36, w: 12 },
    { pos: 1028, h: 70, w: 20 }, { pos: 905,  h: 60, w: 18 },
    { pos: 840,  h: 68, w: 15 }, { pos: 748,  h: 55, w: 15 },
    { pos: 704,  h: 48, w: 18 }, { pos: 621,  h: 30, w: 15 },
    { pos: 540,  h: 38, w: 12 }, { pos: 468,  h: 35, w: 18 },
  ]
  const data: [number, number][] = []
  for (let x = 400; x <= 4000; x += 5) {
    let y = 85 + (Math.random() - 0.5) * 2.5
    for (const p of peaks) {
      y -= p.h * Math.exp(-Math.pow((x - p.pos) / p.w, 2))
    }
    data.push([x, Math.max(-30, Math.min(120, y))])
  }
  return data
}

/** 峰位标注列表 */
const peakLabels = [
  { x: 3059, label: '3059.10' }, { x: 2910, label: '2910.58' },
  { x: 2848, label: '2848.86' }, { x: 2630, label: '2630.91' },
  { x: 2075, label: '2075.41' }, { x: 1600, label: '1600.47' },
  { x: 1450, label: '1450.47' }, { x: 1244, label: '1244.09' },
  { x: 1028, label: '1028.05' }, { x: 840,  label: '840.56'  },
  { x: 748,  label: '748.38'  }, { x: 468,  label: '468.77'  },
]

const initRamanChart = () => {
  if (!ramanChartRef.value) return
  ramanChart = echarts.init(ramanChartRef.value)

  const markLines = peakLabels.map(p => ({
    xAxis: p.x,
    label: {
      formatter: p.label,
      rotate: 90,
      color: '#00e5ff',
      fontSize: 10,
      fontWeight: 'bold',
      position: 'insideEndTop',
      distance: 8,
      backgroundColor: 'rgba(0,12,35,0.7)',
      padding: [2, 4],
      borderRadius: 2,
    },
    lineStyle: { color: 'rgba(0,200,255,0.28)', type: 'dashed' as const, width: 1 }
  }))

  ramanChart.setOption({
    backgroundColor: 'transparent',
    animation: false,
    /**
     * grid 使用固定像素值，精确控制各区域空间：
     *   left  72px  → Y轴标题"强度(a.u.)"(旋转90°约需50px) + 刻度数字 + 间距
     *   right 20px  → 右侧留白
     *   top   40px  → 峰位标注文字上方留白（标注 rotate:90 后向上延伸）
     *   bottom 90px → X轴刻度(~20px) + X轴标题(~20px) + dataZoom(40px) + 间距
     */
    grid: {
      left:   72,
      right:  20,
      top:    40,
      bottom: 90,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,12,35,0.95)',
      borderColor: '#00f6ff',
      borderWidth: 1,
      textStyle: { color: '#00f6ff', fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        return `<b style="color:#00ff88">波数: ${p.data[0]} cm⁻¹</b><br/>强度: ${(p.data[1] as number).toFixed(2)}`
      }
    },
    xAxis: {
      type: 'value',
      name: '拉曼位移 (cm⁻¹)',
      min: 400,
      max: 4000,
      inverse: true,
      nameLocation: 'middle',
      // nameGap = X轴刻度标签到标题的间距
      // 刻度标签高约 18px，dataZoom 高 40px，底部 bottom=4px → gap ≈ 18 + 8 = 26 … 实测用 48
      nameGap: 48,
      nameTextStyle: { color: '#00c8ff', fontSize: 13, fontWeight: 'bold' },
      axisLine:  { lineStyle: { color: '#00f6ff', width: 1.5 } },
      axisTick:  { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#b0e8ff', fontSize: 11, margin: 8 },
      splitLine: { lineStyle: { color: 'rgba(0,246,255,0.07)', width: 1 } },
    },
    yAxis: {
      type: 'value',
      name: '强度 (a.u.)',
      min: -30,
      max: 120,
      nameLocation: 'middle',
      // nameGap = 刻度数字宽度(约28px) + axisLabel.margin(6) + 额外间距
      nameGap: 52,
      nameTextStyle: { color: '#00c8ff', fontSize: 13, fontWeight: 'bold' },
      axisLine:  { lineStyle: { color: '#00f6ff', width: 1.5 } },
      axisTick:  { lineStyle: { color: '#00f6ff' } },
      axisLabel: { color: '#b0e8ff', fontSize: 11, margin: 6 },
      splitLine: { lineStyle: { color: 'rgba(0,246,255,0.07)', width: 1 } },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        // bottom:4 → 距容器底边 4px，高度 40px，不与 X轴标题重叠（X轴标题在 grid 内部）
        bottom: 4,
        height: 40,
        borderColor: 'rgba(0,246,255,0.32)',
        backgroundColor: 'rgba(0,18,50,0.88)',
        dataBackground: {
          lineStyle: { color: '#0099cc', width: 1 },
          areaStyle: { color: 'rgba(0,75,155,0.45)' }
        },
        selectedDataBackground: {
          lineStyle: { color: '#00f6ff', width: 1.5 },
          areaStyle: { color: 'rgba(0,100,200,0.58)' }
        },
        fillerColor: 'rgba(0,100,200,0.18)',
        handleStyle:     { color: '#00f6ff', borderColor: '#00f6ff', borderWidth: 2 },
        moveHandleStyle: { color: '#00f6ff' },
        emphasis: { handleStyle: { color: '#00ff88', borderColor: '#00ff88' } },
        textStyle: { color: '#00c8ff', fontSize: 11 },
        labelFormatter: (v: number) => `${Math.round(v)}`,
      },
      { type: 'inside', xAxisIndex: 0 }
    ],
    series: [{
      type: 'line',
      data: generateRamanData(),
      smooth: false,
      showSymbol: false,
      lineStyle: { width: 1.5, color: '#ff4040' },
      markLine: {
        silent: true,
        animation: false,
        symbol: ['none', 'none'],
        data: markLines,
      }
    }]
  })
}

const handleResize = () => ramanChart?.resize()

onMounted(() => {
  nextTick(() => {
    initRamanChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  ramanChart?.dispose()
})
</script>

<style lang="scss" scoped>
/* ══════════════════════════════════════════
   页面基础
══════════════════════════════════════════ */
.page-container {
  width: 100vw;
  height: 100vh;
  background: #001529;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.spectral-analysis-center {
  flex: 1;
  display: flex;
  padding: 12px 16px 14px 16px;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 0;
  gap: 0;
}

/* ══════════════════════════════════════════
   左侧边栏
══════════════════════════════════════════ */
.left-panel {
  width: 240px;
  flex-shrink: 0;
  margin-right: 14px;

  > * { height: 100%; }   // DvBorderBox13 撑满

  .panel-content {
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
  }

  /* 搜索框行 */
  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;

    .glow-input {
      flex: 1;
      :deep(.el-input__wrapper) {
        background: rgba(0, 21, 41, 0.92);
        border: 1px solid rgba(0, 246, 255, 0.38);
        box-shadow: 0 0 8px rgba(0, 246, 255, 0.1);
        border-radius: 6px;
      }
      :deep(.el-input__inner) {
        color: #00c8ff;
        font-size: 12px;
        &::placeholder { color: rgba(0, 200, 255, 0.32); }
      }
      :deep(.el-input__prefix) { color: rgba(0, 200, 255, 0.52); }
    }

    .add-btn {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      background: rgba(0, 21, 41, 0.92);
      border: 1px solid rgba(0, 246, 255, 0.38);
      color: #00c8ff;
      box-shadow: 0 0 8px rgba(0, 246, 255, 0.1);
      &:hover {
        border-color: #00ff88;
        color: #00ff88;
        box-shadow: 0 0 12px rgba(0, 255, 136, 0.38);
      }
    }
  }

  /* 数据导入按钮 */
  .import-btn {
    width: 100%;
    flex-shrink: 0;
    background: linear-gradient(135deg, #0066cc, #0099ff);
    border: none;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    height: 40px;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(0, 153, 255, 0.38);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
      background: linear-gradient(135deg, #0077dd, #00aaff);
      box-shadow: 0 0 20px rgba(0, 153, 255, 0.55);
    }
  }

  /* 文件树 */
  .tree-container {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 246, 255, 0.22);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track { background: transparent; }
  }

  :deep(.sample-tree) {
    background: transparent;

    .el-tree-node__content {
      background: transparent;
      border-radius: 4px;
      height: 30px;
      transition: background 0.18s;
      &:hover { background: rgba(0, 246, 255, 0.07); }
    }
    .el-tree-node.is-current > .el-tree-node__content {
      background: rgba(0, 100, 255, 0.14);
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      .node-icon {
        font-size: 14px;
        &.folder { color: #ff9900; }
        &.file   { color: rgba(0, 200, 255, 0.52); }
      }
      .node-label {
        font-size: 13px;
        color: rgba(0, 200, 255, 0.78);
        &.active { color: #0099ff; font-weight: bold; }
      }
    }
  }
}

/* ══════════════════════════════════════════
   主内容区：两张卡片垂直排列
══════════════════════════════════════════ */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.card {
  border-radius: 8px;
  overflow: hidden;
  > * { height: 100%; }
}

/*
  光谱卡片 flex:55 ≈ 55% 高度
  匹配卡片 flex:45 ≈ 45% 高度
  两者通过 flex 比例自适应父容器，不写死 px，避免小屏溢出
*/
.spectrum-card {
  flex: 55;
  min-height: 0;

  .card-inner {
    height: 100%;
    padding: 12px 16px 10px 16px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
}

.matching-card {
  flex: 45;
  min-height: 0;
  overflow: hidden;

  .card-inner {
    height: 100%;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
  }
}

/* 通用标题行 */
.card-header { margin-bottom: 8px; flex-shrink: 0; }

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #00c8ff;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.42);
  .title-icon { font-size: 17px; }
}

/* ECharts 容器 */
.chart-wrapper {
  flex: 1;
  min-height: 0;
  .raman-chart { width: 100%; height: 100%; }
}

/* ══════════════════════════════════════════
   官能团匹配 — 头部
══════════════════════════════════════════ */
.matching-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;

  .matching-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
    overflow: hidden;

    .matching-hint {
      font-size: 11.5px;
      color: rgba(0, 200, 255, 0.48);
      white-space: nowrap;        /* ← 禁止换行 */
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
  }

  .matching-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

/* 次要按钮 */
.secondary-btn {
  background: rgba(0, 100, 200, 0.13);
  border: 1px solid rgba(0, 153, 255, 0.48);
  color: #0099ff;
  font-size: 13px;
  height: 30px;
  padding: 0 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    background: rgba(0, 100, 200, 0.26);
    box-shadow: 0 0 10px rgba(0, 153, 255, 0.32);
  }
}

/* 主要按钮（命名区别于 el-button 的默认类） */
.primary-action-btn {
  background: linear-gradient(135deg, #0066cc, #0099ff);
  border: none;
  color: #fff;
  font-size: 13px;
  height: 30px;
  padding: 0 14px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  box-shadow: 0 0 12px rgba(0, 153, 255, 0.42);
  transition: all 0.18s;
  &:hover { box-shadow: 0 0 18px rgba(0, 153, 255, 0.62); }
}

/* ══════════════════════════════════════════
   官能团匹配 — 内容布局
══════════════════════════════════════════ */
.matching-content {
  flex: 1;
  display: flex;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}

/* ══════════════════════════════════════════
   峰位表格
══════════════════════════════════════════ */
.table-col {
  flex: 7;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .peak-table {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 153, 255, 0.18);
    border-radius: 6px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 56px 140px 46px 1fr;
    background: rgba(0, 80, 180, 0.2);
    border-bottom: 1px solid rgba(0, 153, 255, 0.26);
    flex-shrink: 0;

    .th {
      padding: 9px 12px;
      font-size: 13px;
      font-weight: bold;
      color: #00c8ff;
      text-shadow: 0 0 5px rgba(0, 200, 255, 0.26);
    }
  }

  .table-body {
    flex: 1;
    overflow-y: auto;
    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 153, 255, 0.26);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track { background: transparent; }
  }

  .table-row {
    display: grid;
    grid-template-columns: 56px 140px 46px 1fr;
    border-bottom: 1px solid rgba(0, 153, 255, 0.06);
    transition: background 0.14s;

    &:hover { background: rgba(0, 80, 180, 0.08); }

    // 每组最后一行，组间分割线加深
    &.group-last { border-bottom: 1px solid rgba(0, 153, 255, 0.2); }

    .td {
      padding: 6px 12px;
      font-size: 13px;
      color: rgba(0, 200, 255, 0.8);
      display: flex;
      align-items: center;
      gap: 6px;

      &.td-index { color: rgba(0, 200, 255, 0.52); }

      &.td-peak {
        justify-content: space-between;
        .peak-value { font-weight: bold; color: #00c8ff; }
      }

      &.td-check { justify-content: center; }

      &.td-vibration {
        justify-content: space-between;
        .vib-text { flex: 1; }
      }

      .icon-del {
        color: rgba(255, 80, 80, 0.35);
        cursor: pointer;
        font-size: 13px;
        flex-shrink: 0;
        transition: color 0.16s;
        &:hover { color: rgba(255, 80, 80, 0.78); }
      }
    }
  }
}

/* 赛博复选框 */
.cyber-checkbox {
  width: 17px;
  height: 17px;
  border: 1.5px solid rgba(0, 100, 220, 0.72);
  background: rgba(0, 28, 75, 0.52);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.16s;
  flex-shrink: 0;

  &.checked {
    background: #0066cc;
    border-color: #0099ff;
    box-shadow: 0 0 6px rgba(0, 153, 255, 0.52);
  }
  .check-mark { color: #fff; font-size: 11px; font-weight: bold; line-height: 1; }
}

/* ══════════════════════════════════════════
   元素选择面板
══════════════════════════════════════════ */
.element-col {
  flex: 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .element-picker {
    flex: 1;
    border: 1px solid rgba(0, 153, 255, 0.3);
    border-radius: 8px;
    padding: 12px;
    background: rgba(0, 14, 38, 0.36);
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .picker-title { font-size: 13px; font-weight: bold; color: #00c8ff; }

    .picker-actions {
      display: flex;
      gap: 6px;
      .picker-btn {
        background: rgba(0, 100, 200, 0.13);
        border: 1px solid rgba(0, 153, 255, 0.38);
        color: #0099ff;
        font-size: 12px;
        padding: 2px 9px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.16s;
        &:hover {
          background: rgba(0, 100, 200, 0.26);
          box-shadow: 0 0 8px rgba(0, 153, 255, 0.28);
        }
      }
    }
  }

  .element-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    overflow-y: auto;
    align-content: start;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 153, 255, 0.26);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track { background: transparent; }
  }

  .element-cell {
    aspect-ratio: 1;
    border: 1px solid rgba(150, 180, 215, 0.2);
    border-radius: 5px;
    background: rgba(6, 20, 55, 0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.16s;

    &:hover {
      border-color: rgba(0, 153, 255, 0.58);
      background: rgba(0, 52, 125, 0.38);
      box-shadow: 0 0 8px rgba(0, 153, 255, 0.26);
    }

    &.selected {
      border-color: rgba(0, 153, 255, 0.75);
      background: rgba(0, 52, 148, 0.45);
      box-shadow: 0 0 10px rgba(0, 153, 255, 0.35);

      .el-dot {
        background: #0066cc;
        border-color: #0099ff;
        box-shadow: 0 0 4px rgba(0, 153, 255, 0.62);
      }
    }

    .el-symbol {
      font-size: 13px;
      font-weight: bold;
      color: rgba(0, 200, 255, 0.86);
    }

    // 右下角小方块：选中指示
    .el-dot {
      position: absolute;
      bottom: 3px;
      right: 3px;
      width: 7px;
      height: 7px;
      border: 1px solid rgba(130, 165, 205, 0.35);
      border-radius: 1px;
      background: transparent;
      transition: all 0.16s;
    }
  }
}
</style>