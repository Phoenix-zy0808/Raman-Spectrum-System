<template>
  <div class="dm-container">
    <!-- 顶部标题栏 - 大屏风格 -->
    <div class="big-screen-header">
      <div class="header-left">
        <div class="corner-deco top-left"></div>
        <span class="section-label">数据管理中心</span>
      </div>
      <h1 class="main-title">
        <span class="title-glow">拉曼光谱</span>数据管理平台
        <div class="title-underline"></div>
      </h1>
      <div class="header-right">
        <span class="datetime">{{ currentTime }}</span>
        <div class="corner-deco top-right"></div>
      </div>
    </div>

    <div class="big-screen-content">

      <!-- ================= 左侧：数据上传与导入 ================= -->
      <div class="data-panel left-panel">
        <div class="panel-title-bar">
          <div class="title-icon">
            <div class="icon-dot"></div>
          </div>
          <span class="title-text">数据上传与导入</span>
          <div class="title-line"></div>
        </div>

        <div class="panel-content">
          <!-- Tab 切换 -->
          <div class="upload-tabs">
            <div
              v-for="tab in uploadTabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: uploadMode === tab.id }"
              @click="uploadMode = tab.id"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </div>
          </div>

          <!-- 本地文件上传 -->
          <div v-if="uploadMode === 'local'" class="upload-section">
            <div class="upload-drop-zone" @click="handleFileSelect">
              <div class="upload-icon-wrapper">
                <svg class="upload-icon" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8V32M24 8L16 16M24 8L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 32V38C8 39.1046 8.89543 40 10 40H38C39.1046 40 40 39.1046 40 38V32" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <p class="upload-text">点击或拖拽文件到此处上传</p>
              <div class="format-tags">
                <span class="format-tag">.spc</span>
                <span class="format-tag">.txt</span>
                <span class="format-tag">.csv</span>
                <span class="format-tag">.mat</span>
              </div>
            </div>
            <div class="upload-actions">
              <button class="cyber-btn primary" @click="handleFileSelect">
                <span class="btn-bg"></span>
                <span class="btn-text">选择文件</span>
              </button>
              <button class="cyber-btn secondary" @click="handleFolderSelect">
                <span class="btn-bg"></span>
                <span class="btn-text">批量导入文件夹</span>
              </button>
            </div>
          </div>

          <!-- 云端数据库 -->
          <div v-if="uploadMode === 'cloud'" class="upload-section">
            <div class="cloud-database-list">
              <div
                v-for="db in cloudDatabases"
                :key="db.id"
                class="cloud-db-item"
                @click="importFromCloud(db)"
              >
                <div class="db-icon">
                  <div class="db-dot"></div>
                </div>
                <div class="db-info">
                  <div class="db-name">{{ db.name }}</div>
                  <div class="db-meta">
                    <span class="db-count">{{ db.count }} 条数据</span>
                    <span class="db-size">{{ db.size }}</span>
                  </div>
                </div>
                <button class="import-btn">导入</button>
              </div>
            </div>
          </div>

          <!-- 仪器直连 -->
          <div v-if="uploadMode === 'device'" class="upload-section">
            <div class="device-connect-panel">
              <div class="device-status-card">
                <div class="status-row">
                  <span class="status-label">设备型号</span>
                  <span class="status-value">Horiba LabRAM HR</span>
                </div>
                <div class="status-row">
                  <span class="status-label">设备IP</span>
                  <span class="status-value ip-address">192.168.1.102</span>
                </div>
                <div class="status-row">
                  <span class="status-label">连接状态</span>
                  <span class="status-value">
                    <span class="status-indicator online"></span>
                    在线
                  </span>
                </div>
              </div>

              <div class="device-log">
                <div class="log-header">API 连接日志</div>
                <div class="log-content">
                  <div v-for="(log, idx) in deviceLogs" :key="idx" class="log-line">
                    <span class="log-time">{{ log.time }}</span>
                    <span class="log-msg" :class="log.type">{{ log.message }}</span>
                  </div>
                </div>
              </div>

              <button class="cyber-btn primary full-width" @click="syncFromDevice">
                <span class="btn-bg"></span>
                <span class="btn-text">同步最新光谱数据</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 中间：数据列表与筛选 ================= -->
      <div class="data-panel center-panel">
        <div class="panel-title-bar">
          <div class="title-icon">
            <div class="icon-dot"></div>
          </div>
          <span class="title-text">实验数据总览</span>
          <div class="title-line"></div>
          <div class="panel-stats">
            <span class="stat-item">
              <span class="stat-label">总计</span>
              <span class="stat-value">{{ dataList.length }}</span>
            </span>
          </div>
        </div>

        <div class="panel-content">
          <!-- 高级筛选区 -->
          <div class="filter-panel">
            <div class="filter-grid">
              <div class="filter-item">
                <input
                  type="text"
                  class="cyber-input"
                  placeholder="🔍 实验ID / 样品名称"
                  v-model="searchKeyword"
                />
              </div>
              <div class="filter-item">
                <select class="cyber-select" v-model="filterDate">
                  <option value="">全部日期</option>
                  <option value="today">今天</option>
                  <option value="week">近7天</option>
                  <option value="month">近30天</option>
                </select>
              </div>
              <div class="filter-item">
                <select class="cyber-select" v-model="filterSampleType">
                  <option value="">样品类型: 全部</option>
                  <option value="tissue">生物切片</option>
                  <option value="powder">粉末压片</option>
                  <option value="liquid">液体溶胶</option>
                </select>
              </div>
            </div>

            <div class="filter-grid secondary">
              <div class="filter-label">多模态筛选:</div>
              <div class="filter-item">
                <select class="cyber-select compact" v-model="filterSpatial">
                  <option value="">空间位置: 全部</option>
                  <option value="center">中心区域</option>
                  <option value="edge">边缘区域</option>
                </select>
              </div>
              <div class="filter-item">
                <select class="cyber-select compact" v-model="filterTime">
                  <option value="">时间序列: 全部</option>
                  <option value="short">0-10s</option>
                  <option value="medium">10-60s</option>
                  <option value="long">60s+</option>
                </select>
              </div>
              <div class="filter-checkbox">
                <input type="checkbox" id="lowSnr" v-model="showLowSnrOnly" />
                <label for="lowSnr">仅低信噪比数据</label>
              </div>
            </div>
          </div>

          <!-- 数据表格 -->
          <div class="data-table-wrapper">
            <table class="cyber-table">
              <thead>
                <tr>
                  <th>实验ID</th>
                  <th>样品名称</th>
                  <th>多模态标签</th>
                  <th>信噪比(SNR)</th>
                  <th>数据完整度</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredDataList"
                  :key="item.id"
                  class="data-row"
                >
                  <td class="mono-font">{{ item.id }}</td>
                  <td>{{ item.sample }}</td>
                  <td>
                    <span v-if="item.spatial" class="data-tag spatial">{{ item.spatial }}</span>
                    <span v-if="item.time" class="data-tag temporal">{{ item.time }}</span>
                  </td>
                  <td>
                    <span class="snr-value" :class="getSnrClass(item.snr)">
                      {{ item.snr }}dB
                    </span>
                  </td>
                  <td>
                    <div class="integrity-display">
                      <div class="integrity-bar">
                        <div
                          class="integrity-fill"
                          :style="{
                            width: item.integrity + '%',
                            background: getIntegrityGradient(item.integrity)
                          }"
                        ></div>
                      </div>
                      <span class="integrity-text">{{ item.integrity }}%</span>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-btn view" @click="viewMetadata(item)" title="查看详情">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
                        </svg>
                      </button>
                      <button class="action-btn edit" @click="editMetadata(item)" title="编辑">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
                        </svg>
                      </button>
                      <button class="action-btn delete" @click="deleteData(item)" title="删除">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= 右侧：预处理队列 ================= -->
      <div class="data-panel right-panel">
        <div class="panel-title-bar">
          <div class="title-icon">
            <div class="icon-dot"></div>
          </div>
          <span class="title-text">数据预处理队列</span>
          <div class="title-line"></div>
        </div>

        <div class="panel-content">
          <!-- 处理中 -->
          <div class="queue-section">
            <div class="queue-header">
              <span class="queue-title">进行中</span>
              <span class="queue-badge processing">{{ processingTasks.length }}</span>
            </div>
            <div class="task-list">
              <div
                v-for="task in processingTasks"
                :key="task.id"
                class="task-card processing"
              >
                <div class="task-header">
                  <span class="task-name">{{ task.name }}</span>
                  <span class="task-progress-text">{{ task.progress }}%</span>
                </div>
                <div class="task-step">{{ task.currentStep }}</div>
                <div class="task-progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: task.progress + '%' }"
                  >
                    <div class="progress-glow"></div>
                  </div>
                </div>
                <div class="task-footer">
                  <span class="task-eta">预计剩余: {{ task.eta }}s</span>
                  <span class="task-speed">{{ task.speed }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 等待中 -->
          <div class="queue-section">
            <div class="queue-header">
              <span class="queue-title">等待中</span>
              <span class="queue-badge pending">{{ pendingTasks.length }}</span>
            </div>
            <div class="pending-list">
              <div
                v-for="task in pendingTasks"
                :key="task.id"
                class="pending-item"
              >
                <div class="pending-indicator"></div>
                <span class="pending-name">{{ task.name }}</span>
                <span class="pending-position">#{{ task.pos }}</span>
              </div>
            </div>
          </div>

          <!-- 历史记录 -->
          <div class="queue-section history">
            <div class="queue-header">
              <span class="queue-title">历史记录</span>
              <button class="clear-history" @click="clearHistory">清空</button>
            </div>
            <div class="history-list">
              <div
                v-for="task in historyTasks"
                :key="task.id"
                class="history-item"
              >
                <div class="history-status">
                  <svg class="status-icon success" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                  </svg>
                </div>
                <div class="history-content">
                  <div class="history-name">{{ task.name }}</div>
                  <div class="history-params">{{ task.params }}</div>
                </div>
                <div class="history-time">{{ task.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ================= 元数据编辑弹窗 ================= -->
    <transition name="modal-fade">
      <div v-if="showMetadataModal" class="modal-overlay" @click.self="closeModal">
        <div class="cyber-modal">
          <div class="modal-header">
            <div class="modal-title">
              <div class="title-icon-sm"></div>
              <span>元数据编辑器</span>
            </div>
            <button class="modal-close" @click="closeModal">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>

          <div class="modal-body" v-if="currentEditItem">
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">实验ID</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.id"
                  disabled
                />
              </div>

              <div class="form-field">
                <label class="field-label">样品名称</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.sample"
                />
              </div>

              <div class="form-field">
                <label class="field-label">激光波长 (nm)</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.wavelength"
                />
              </div>

              <div class="form-field">
                <label class="field-label">积分时间 (s)</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.integrationTime"
                />
              </div>

              <div class="form-field full-width">
                <label class="field-label">空间位置</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.spatial"
                  placeholder="如: Pos(10,20)"
                />
              </div>

              <div class="form-field full-width">
                <label class="field-label">时间序列</label>
                <input
                  type="text"
                  class="cyber-input"
                  v-model="currentEditItem.time"
                  placeholder="如: T=5s"
                />
              </div>

              <div class="form-field full-width">
                <label class="field-label">实验备注</label>
                <textarea
                  class="cyber-textarea"
                  v-model="currentEditItem.notes"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cyber-btn secondary" @click="closeModal">
              <span class="btn-bg"></span>
              <span class="btn-text">取消</span>
            </button>
            <button class="cyber-btn primary" @click="saveMetadata">
              <span class="btn-bg"></span>
              <span class="btn-text">保存修改</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted, onUnmounted } from 'vue';

// ==================== 类型定义 ====================
interface DataItem {
  id: string;
  sample: string;
  spatial: string;
  time: string;
  snr: number;
  integrity: number;
  wavelength?: string;
  integrationTime?: string;
  notes?: string;
  sampleType?: string;
  createDate?: string;
}

interface CloudDatabase {
  id: number;
  name: string;
  count: number;
  size: string;
}

interface ProcessingTask {
  id: number;
  name: string;
  currentStep: string;
  progress: number;
  eta: number;
  speed: string;
}

interface PendingTask {
  id: number;
  name: string;
  pos: number;
}

interface HistoryTask {
  id: number;
  name: string;
  params: string;
  time: string;
}

interface DeviceLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface UploadTab {
  id: 'local' | 'cloud' | 'device';
  label: string;
  icon: string;
}

export default defineComponent({
  name: 'DataManagement',
  setup() {
    // ==================== 响应式数据 ====================
    const uploadMode = ref<'local' | 'cloud' | 'device'>('local');
    const showMetadataModal = ref(false);
    const currentEditItem = ref<DataItem | null>(null);
    const currentTime = ref('');

    // 筛选条件
    const searchKeyword = ref('');
    const filterDate = ref('');
    const filterSampleType = ref('');
    const filterSpatial = ref('');
    const filterTime = ref('');
    const showLowSnrOnly = ref(false);

    // 上传Tab配置
    const uploadTabs: UploadTab[] = [
      { id: 'local', label: '本地文件', icon: '📁' },
      { id: 'cloud', label: '云端库', icon: '☁️' },
      { id: 'device', label: '仪器直连', icon: '🔗' }
    ];

    // 云端数据库
    const cloudDatabases = reactive<CloudDatabase[]>([
      { id: 1, name: 'Exp_DB_2025_Q1', count: 1247, size: '3.2GB' },
      { id: 2, name: 'Public_SERS_Library', count: 5893, size: '12.8GB' },
      { id: 3, name: 'Historical_Archive_2024', count: 892, size: '2.1GB' },
    ]);

    // 设备日志
    const deviceLogs = reactive<DeviceLog[]>([
      { time: '16:05:01', message: 'Connecting to Horiba API...', type: 'info' },
      { time: '16:05:02', message: 'Handshake success', type: 'success' },
      { time: '16:05:03', message: 'Device ready for data acquisition', type: 'success' },
    ]);

    // 数据列表
    const dataList = reactive<DataItem[]>([
      {
        id: 'EXP_2026_0801',
        sample: 'Liver_Tissue_X1',
        spatial: 'Pos(10,20)',
        time: 'T=5s',
        snr: 45,
        integrity: 100,
        wavelength: '785',
        integrationTime: '10',
        notes: '实验组A，基线正常',
        sampleType: 'tissue',
        createDate: 'today'
      },
      {
        id: 'EXP_2026_0802',
        sample: 'Liver_Tissue_X2',
        spatial: 'Pos(12,20)',
        time: 'T=10s',
        snr: 42,
        integrity: 98,
        wavelength: '785',
        integrationTime: '10',
        notes: '实验组A，数据质量良好',
        sampleType: 'tissue',
        createDate: 'today'
      },
      {
        id: 'EXP_2026_0803',
        sample: 'Unknown_Powder_A',
        spatial: '',
        time: '',
        snr: 15,
        integrity: 60,
        wavelength: '532',
        integrationTime: '5',
        notes: '信噪比偏低，需重测',
        sampleType: 'powder',
        createDate: 'week'
      },
      {
        id: 'EXP_2026_0804',
        sample: 'SERS_Gold_NP',
        spatial: 'Center',
        time: 'T=0s',
        snr: 88,
        integrity: 100,
        wavelength: '633',
        integrationTime: '2',
        notes: '标准样品，质量优秀',
        sampleType: 'powder',
        createDate: 'today'
      },
      {
        id: 'EXP_2026_0805',
        sample: 'Blood_Serum_09',
        spatial: '',
        time: 'T=30m',
        snr: 30,
        integrity: 92,
        wavelength: '785',
        integrationTime: '15',
        notes: '时间序列实验第9组',
        sampleType: 'liquid',
        createDate: 'week'
      },
      {
        id: 'EXP_2026_0806',
        sample: 'Control_Group_B1',
        spatial: 'Region_1',
        time: '',
        snr: 55,
        integrity: 99,
        wavelength: '785',
        integrationTime: '10',
        notes: '对照组B区域1',
        sampleType: 'tissue',
        createDate: 'week'
      },
      {
        id: 'EXP_2026_0807',
        sample: 'Control_Group_B2',
        spatial: 'Region_2',
        time: '',
        snr: 52,
        integrity: 97,
        wavelength: '785',
        integrationTime: '10',
        notes: '对照组B区域2',
        sampleType: 'tissue',
        createDate: 'week'
      },
      {
        id: 'EXP_2026_0808',
        sample: 'Test_Sample_Fail',
        spatial: '',
        time: '',
        snr: 8,
        integrity: 40,
        wavelength: '785',
        integrationTime: '10',
        notes: '采集失败，数据不完整',
        sampleType: 'tissue',
        createDate: 'month'
      },
    ]);

    // 处理中的任务
    const processingTasks = reactive<ProcessingTask[]>([
      {
        id: 1,
        name: 'Batch_Upload_Folder_A',
        currentStep: '去噪处理 (Wavelet Denoising)',
        progress: 65,
        eta: 12,
        speed: '2.3 MB/s'
      },
      {
        id: 2,
        name: 'Stream_Data_20260207',
        currentStep: '基线校正 (AirPLS)',
        progress: 30,
        eta: 45,
        speed: '1.8 MB/s'
      },
    ]);

    // 等待中的任务
    const pendingTasks = reactive<PendingTask[]>([
      { id: 3, name: 'Backup_Log_File.txt', pos: 1 },
      { id: 4, name: 'Calibration_Std.spc', pos: 2 },
      { id: 5, name: 'Sample_Dataset_C.mat', pos: 3 },
    ]);

    // 历史任务
    const historyTasks = reactive<HistoryTask[]>([
      { id: 101, name: 'Exp_2026_001.mat', params: 'Smooth: SG-5 | Baseline: AirPLS', time: '10:00' },
      { id: 102, name: 'Exp_2026_002.mat', params: 'Denoise: Wavelet | Normalize: SNV', time: '09:45' },
      { id: 103, name: 'Batch_Folder_X.zip', params: 'Auto-process: Standard Pipeline', time: '09:30' },
    ]);

    // ==================== 计算属性 ====================
    const filteredDataList = computed(() => {
      let result = dataList;

      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(item =>
          item.id.toLowerCase().includes(keyword) ||
          item.sample.toLowerCase().includes(keyword)
        );
      }

      // 日期筛选
      if (filterDate.value) {
        result = result.filter(item => item.createDate === filterDate.value);
      }

      // 样品类型筛选
      if (filterSampleType.value) {
        result = result.filter(item => item.sampleType === filterSampleType.value);
      }

      // 空间位置筛选
      if (filterSpatial.value) {
        result = result.filter(item => item.spatial.toLowerCase().includes(filterSpatial.value));
      }

      // 时间序列筛选
      if (filterTime.value) {
        result = result.filter(item => item.time !== '');
      }

      // 低信噪比筛选
      if (showLowSnrOnly.value) {
        result = result.filter(item => item.snr < 30);
      }

      return result;
    });

    // ==================== 方法 ====================

    // 更新当前时间
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      currentTime.value = `${year}-${month}-${day} ${weekday} ${hours}:${minutes}:${seconds}`;
    };

    // SNR 样式类
    const getSnrClass = (snr: number): string => {
      if (snr >= 40) return 'high';
      if (snr >= 20) return 'medium';
      return 'low';
    };

    // 完整度渐变色
    const getIntegrityGradient = (value: number): string => {
      if (value === 100) return 'linear-gradient(90deg, #00ff9d, #00d4ff)';
      if (value >= 80) return 'linear-gradient(90deg, #00c6fb, #005bea)';
      if (value >= 60) return 'linear-gradient(90deg, #ffd700, #ff8c00)';
      return 'linear-gradient(90deg, #ff4d4d, #cc0000)';
    };

    // 文件选择
    const handleFileSelect = () => {
      alert('打开文件选择器（实际项目中调用文件API）');
    };

    const handleFolderSelect = () => {
      alert('打开文件夹选择器（实际项目中调用文件API）');
    };

    // 云端导入
    const importFromCloud = (db: CloudDatabase) => {
      alert(`正在从 ${db.name} 导入数据...`);
    };

    // 设备同步
    const syncFromDevice = () => {
      deviceLogs.push({
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        message: 'Starting data sync...',
        type: 'info'
      });

      setTimeout(() => {
        deviceLogs.push({
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          message: 'Sync completed successfully',
          type: 'success'
        });
      }, 1000);
    };

    // 查看元数据
    const viewMetadata = (item: DataItem) => {
      currentEditItem.value = { ...item };
      showMetadataModal.value = true;
    };

    // 编辑元数据
    const editMetadata = (item: DataItem) => {
      currentEditItem.value = { ...item };
      showMetadataModal.value = true;
    };

    // 删除数据
    const deleteData = (item: DataItem) => {
      if (confirm(`确定要删除 ${item.id} 吗？`)) {
        const index = dataList.findIndex(d => d.id === item.id);
        if (index !== -1) {
          dataList.splice(index, 1);
        }
      }
    };

    // 保存元数据
    const saveMetadata = () => {
      if (currentEditItem.value) {
        const index = dataList.findIndex(item => item.id === currentEditItem.value!.id);
        if (index !== -1) {
          Object.assign(dataList[index], currentEditItem.value);
        }
        closeModal();
      }
    };

    // 关闭弹窗
    const closeModal = () => {
      showMetadataModal.value = false;
      currentEditItem.value = null;
    };

    // 清空历史
    const clearHistory = () => {
      if (confirm('确定要清空所有历史记录吗？')) {
        historyTasks.splice(0, historyTasks.length);
      }
    };

    // ==================== 生命周期 ====================
    let timeInterval: number | null = null;

    onMounted(() => {
      updateTime();
      timeInterval = window.setInterval(updateTime, 1000);
    });

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    });

    return {
      // 数据
      uploadMode,
      uploadTabs,
      cloudDatabases,
      deviceLogs,
      dataList,
      filteredDataList,
      processingTasks,
      pendingTasks,
      historyTasks,
      showMetadataModal,
      currentEditItem,
      currentTime,

      // 筛选
      searchKeyword,
      filterDate,
      filterSampleType,
      filterSpatial,
      filterTime,
      showLowSnrOnly,

      // 方法
      getSnrClass,
      getIntegrityGradient,
      handleFileSelect,
      handleFolderSelect,
      importFromCloud,
      syncFromDevice,
      viewMetadata,
      editMetadata,
      deleteData,
      saveMetadata,
      closeModal,
      clearHistory,
    };
  }
});
</script>

<style scoped>
/* ==================== 全局样式 ==================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dm-container {
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(0, 198, 251, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 255, 157, 0.05) 0%, transparent 50%),
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 198, 251, 0.03) 2px, rgba(0, 198, 251, 0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 198, 251, 0.03) 2px, rgba(0, 198, 251, 0.03) 4px);
  color: #e0e6ed;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  padding: 20px;
  overflow-x: hidden;
}

/* ==================== 顶部标题栏 ==================== */
.big-screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 80px;
  margin-bottom: 20px;
  position: relative;
}

.big-screen-header::before,
.big-screen-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 198, 251, 0.5), transparent);
}

.big-screen-header::before { top: 0; }
.big-screen-header::after { bottom: 0; }

.header-left,
.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.header-right {
  justify-content: flex-end;
}

.corner-deco {
  width: 40px;
  height: 40px;
  position: relative;
}

.corner-deco::before,
.corner-deco::after {
  content: '';
  position: absolute;
  background: #00c6fb;
}

.corner-deco.top-left::before {
  top: 0;
  left: 0;
  width: 2px;
  height: 20px;
}

.corner-deco.top-left::after {
  top: 0;
  left: 0;
  width: 20px;
  height: 2px;
}

.corner-deco.top-right::before {
  top: 0;
  right: 0;
  width: 2px;
  height: 20px;
}

.corner-deco.top-right::after {
  top: 0;
  right: 0;
  width: 20px;
  height: 2px;
}

.section-label {
  color: #00c6fb;
  font-size: 14px;
  letter-spacing: 2px;
  margin-left: 15px;
  text-transform: uppercase;
}

.main-title {
  text-align: center;
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 4px;
  color: #fff;
  position: relative;
  padding-bottom: 10px;
}

.title-glow {
  background: linear-gradient(90deg, #00c6fb, #00ff9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 500;
}

.title-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00c6fb, transparent);
}

.datetime {
  color: #00ff9d;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  margin-right: 15px;
  letter-spacing: 1px;
}

/* ==================== 主内容区 ==================== */
.big-screen-content {
  display: grid;
  grid-template-columns: 380px 1fr 380px;
  gap: 20px;
  height: calc(100vh - 140px);
}

/* ==================== 数据面板 ==================== */
.data-panel {
  background: rgba(13, 22, 45, 0.6);
  border: 1px solid rgba(0, 198, 251, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.data-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 198, 251, 0.5), transparent);
}

/* 面板标题栏 */
.panel-title-bar {
  height: 50px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(0, 198, 251, 0.1);
  background: linear-gradient(90deg, rgba(0, 198, 251, 0.05), transparent);
}

.title-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-dot {
  width: 8px;
  height: 8px;
  background: #00ff9d;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff9d;
}

.title-text {
  color: #00c6fb;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 198, 251, 0.3), transparent);
}

.panel-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-label {
  color: #888;
  font-size: 12px;
}

.stat-value {
  color: #00ff9d;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ==================== 左侧：上传区域 ==================== */
.upload-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 198, 251, 0.2);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.tab-btn:hover {
  background: rgba(0, 198, 251, 0.1);
  border-color: #00c6fb;
}

.tab-btn.active {
  background: rgba(0, 198, 251, 0.2);
  border-color: #00c6fb;
  box-shadow: 0 0 10px rgba(0, 198, 251, 0.3);
}

.tab-icon {
  font-size: 24px;
}

.tab-label {
  color: #ccc;
  font-size: 12px;
}

.tab-btn.active .tab-label {
  color: #00c6fb;
}

/* 上传区 */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-drop-zone {
  border: 2px dashed rgba(0, 198, 251, 0.3);
  background: rgba(0, 198, 251, 0.02);
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-drop-zone:hover {
  border-color: #00c6fb;
  background: rgba(0, 198, 251, 0.05);
  box-shadow: 0 0 20px rgba(0, 198, 251, 0.1);
}

.upload-icon-wrapper {
  margin-bottom: 15px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #00c6fb;
  margin: 0 auto;
}

.upload-text {
  color: #ccc;
  margin-bottom: 15px;
  font-size: 14px;
}

.format-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.format-tag {
  padding: 3px 8px;
  background: rgba(0, 198, 251, 0.1);
  border: 1px solid rgba(0, 198, 251, 0.3);
  color: #00c6fb;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 云端数据库列表 */
.cloud-database-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cloud-db-item {
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 198, 251, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.cloud-db-item:hover {
  background: rgba(0, 198, 251, 0.1);
  border-color: #00c6fb;
  transform: translateX(5px);
}

.db-icon {
  width: 40px;
  height: 40px;
  background: rgba(0, 198, 251, 0.1);
  border: 1px solid #00c6fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.db-dot {
  width: 8px;
  height: 8px;
  background: #00c6fb;
  border-radius: 50%;
  box-shadow: 0 0 10px #00c6fb;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.db-info {
  flex: 1;
}

.db-name {
  color: #fff;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  margin-bottom: 5px;
}

.db-meta {
  display: flex;
  gap: 15px;
  font-size: 11px;
  color: #888;
}

.import-btn {
  padding: 6px 15px;
  background: transparent;
  border: 1px solid #00c6fb;
  color: #00c6fb;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.import-btn:hover {
  background: #00c6fb;
  color: #000;
}

/* 设备连接面板 */
.device-connect-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-status-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 157, 0.3);
  padding: 15px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  color: #888;
  font-size: 12px;
}

.status-value {
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-address {
  font-family: 'Courier New', monospace;
  color: #00c6fb;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

.status-indicator.online {
  background: #00ff9d;
  box-shadow: 0 0 10px #00ff9d;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.device-log {
  background: #000;
  border: 1px solid #333;
}

.log-header {
  padding: 8px 12px;
  background: rgba(0, 198, 251, 0.1);
  color: #00c6fb;
  font-size: 12px;
  border-bottom: 1px solid #333;
}

.log-content {
  height: 120px;
  overflow-y: auto;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.log-line {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.log-time {
  color: #666;
}

.log-msg {
  color: #00ff9d;
}

.log-msg.info { color: #00c6fb; }
.log-msg.error { color: #ff4d4d; }

/* ==================== 中间：数据列表 ==================== */
.center-panel {
  overflow: hidden;
}

/* 筛选面板 */
.filter-panel {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(0, 198, 251, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-grid.secondary {
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
}

.filter-label {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
}

.cyber-input,
.cyber-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(13, 22, 45, 0.8);
  border: 1px solid rgba(0, 198, 251, 0.3);
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
}

.cyber-input:focus,
.cyber-select:focus {
  border-color: #00c6fb;
  box-shadow: 0 0 10px rgba(0, 198, 251, 0.2);
}

.cyber-select.compact {
  font-size: 12px;
  padding: 6px 10px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 12px;
}

.filter-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 数据表格 */
.data-table-wrapper {
  flex: 1;
  overflow: auto;
  border: 1px solid rgba(0, 198, 251, 0.1);
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cyber-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(13, 22, 45, 0.95);
}

.cyber-table th {
  padding: 12px;
  text-align: left;
  color: #00c6fb;
  font-weight: 500;
  border-bottom: 2px solid rgba(0, 198, 251, 0.3);
  white-space: nowrap;
}

.cyber-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  color: #ccc;
}

.data-row {
  transition: all 0.2s;
}

.data-row:hover {
  background: rgba(0, 198, 251, 0.05);
}

.mono-font {
  font-family: 'Courier New', monospace;
  color: #00c6fb;
  font-size: 12px;
}

.data-tag {
  display: inline-block;
  padding: 3px 8px;
  margin-right: 5px;
  font-size: 11px;
  border-radius: 2px;
}

.data-tag.spatial {
  background: rgba(255, 0, 255, 0.15);
  color: #ff55ff;
  border: 1px solid rgba(255, 0, 255, 0.3);
}

.data-tag.temporal {
  background: rgba(255, 165, 0, 0.15);
  color: #ffa500;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.snr-value {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.snr-value.high { color: #00ff9d; }
.snr-value.medium { color: #ffd700; }
.snr-value.low { color: #ff4d4d; }

.integrity-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.integrity-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 198, 251, 0.2);
}

.integrity-fill {
  height: 100%;
  transition: width 0.3s;
}

.integrity-text {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #00c6fb;
  min-width: 40px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(0, 198, 251, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn svg {
  width: 14px;
  height: 14px;
  color: #00c6fb;
}

.action-btn:hover {
  background: rgba(0, 198, 251, 0.1);
  border-color: #00c6fb;
  transform: translateY(-2px);
}

.action-btn.delete {
  border-color: rgba(255, 77, 77, 0.3);
}

.action-btn.delete svg {
  color: #ff4d4d;
}

.action-btn.delete:hover {
  background: rgba(255, 77, 77, 0.1);
  border-color: #ff4d4d;
}

/* ==================== 右侧：处理队列 ==================== */
.queue-section {
  margin-bottom: 20px;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 198, 251, 0.1);
}

.queue-title {
  color: #888;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.queue-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.queue-badge.processing {
  background: rgba(0, 198, 251, 0.2);
  color: #00c6fb;
}

.queue-badge.pending {
  background: rgba(255, 191, 0, 0.2);
  color: #ffbf00;
}

/* 任务卡片 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #00c6fb;
  border-right: 1px solid rgba(0, 198, 251, 0.2);
  border-top: 1px solid rgba(0, 198, 251, 0.2);
  border-bottom: 1px solid rgba(0, 198, 251, 0.2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-name {
  color: #fff;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.task-progress-text {
  color: #00c6fb;
  font-size: 12px;
  font-weight: bold;
}

.task-step {
  color: #00ff9d;
  font-size: 11px;
  margin-bottom: 8px;
}

.task-progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00c6fb, #005bea);
  transition: width 0.5s;
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.task-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.task-speed {
  color: #888;
}

/* 等待列表 */
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pending-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 191, 0, 0.2);
  transition: all 0.2s;
}

.pending-item:hover {
  background: rgba(255, 191, 0, 0.05);
}

.pending-indicator {
  width: 6px;
  height: 6px;
  background: #ffbf00;
  border-radius: 50%;
  box-shadow: 0 0 8px #ffbf00;
  margin-right: 10px;
}

.pending-name {
  flex: 1;
  color: #ccc;
  font-size: 12px;
}

.pending-position {
  color: #666;
  font-size: 11px;
}

/* 历史记录 */
.clear-history {
  padding: 3px 10px;
  background: transparent;
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.clear-history:hover {
  background: rgba(255, 77, 77, 0.1);
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 157, 0.1);
}

.history-status {
  width: 20px;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.status-icon {
  width: 14px;
  height: 14px;
}

.status-icon.success {
  color: #00ff9d;
}

.history-content {
  flex: 1;
}

.history-name {
  color: #ccc;
  font-size: 12px;
  margin-bottom: 4px;
}

.history-params {
  color: #666;
  font-size: 11px;
}

.history-time {
  color: #444;
  font-size: 11px;
  white-space: nowrap;
}

/* ==================== 通用按钮 ==================== */
.cyber-btn {
  position: relative;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #00c6fb;
  color: #00c6fb;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-bg {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 198, 251, 0.2), transparent);
  transition: left 0.5s;
}

.cyber-btn:hover .btn-bg {
  left: 100%;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.cyber-btn.primary {
  border-color: #00c6fb;
  background: rgba(0, 198, 251, 0.1);
}

.cyber-btn.primary:hover {
  background: rgba(0, 198, 251, 0.2);
  box-shadow: 0 0 15px rgba(0, 198, 251, 0.3);
}

.cyber-btn.secondary {
  border-color: #005bea;
  background: rgba(0, 91, 234, 0.1);
  color: #00c6fb;
}

.cyber-btn.secondary:hover {
  background: rgba(0, 91, 234, 0.2);
}

.cyber-btn.full-width {
  width: 100%;
}

/* ==================== 弹窗 ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cyber-modal {
  width: 600px;
  max-width: 100%;
  background: rgba(13, 22, 45, 0.95);
  border: 1px solid #00c6fb;
  box-shadow: 0 0 30px rgba(0, 198, 251, 0.3);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 198, 251, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(0, 198, 251, 0.1), transparent);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00c6fb;
  font-size: 18px;
  font-weight: 500;
}

.title-icon-sm {
  width: 8px;
  height: 8px;
  background: #00ff9d;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff9d;
}

.modal-close {
  width: 30px;
  height: 30px;
  background: transparent;
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 77, 77, 0.1);
  border-color: #ff4d4d;
}

.modal-close svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cyber-textarea {
  width: 100%;
  padding: 8px 12px;
  background: rgba(13, 22, 45, 0.8);
  border: 1px solid rgba(0, 198, 251, 0.3);
  color: #fff;
  font-size: 13px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
}

.cyber-textarea:focus {
  border-color: #00c6fb;
  box-shadow: 0 0 10px rgba(0, 198, 251, 0.2);
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid rgba(0, 198, 251, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* 弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .cyber-modal,
.modal-fade-leave-active .cyber-modal {
  transition: transform 0.3s;
}

.modal-fade-enter-from .cyber-modal,
.modal-fade-leave-to .cyber-modal {
  transform: scale(0.9);
}

/* ==================== 滚动条 ==================== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 198, 251, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 198, 251, 0.5);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1600px) {
  .big-screen-content {
    grid-template-columns: 340px 1fr 340px;
  }
}

@media (max-width: 1400px) {
  .big-screen-content {
    grid-template-columns: 300px 1fr 300px;
  }

  .main-title {
    font-size: 28px;
  }
}

@media (max-width: 1200px) {
  .big-screen-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }

  .data-panel {
    max-height: 500px;
  }
}
</style>