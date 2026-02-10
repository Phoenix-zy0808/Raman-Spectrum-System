<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧面板 - 算法配置中心 -->
      <div class="left-panel">
        <dv-border-box-12>
          <div class="panel-content">
            <div class="panel-title">
              <span class="title-text">算法配置中心</span>
              <span class="title-icon">⚙️</span>
            </div>

            <el-tabs v-model="activeTab" class="model-tabs">
              <!-- 预处理算法 Tab -->
              <el-tab-pane label="预处理算法" name="preprocess">
                <div class="config-section">
                  <!-- 基线校正 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('baseline')">
                      <span class="group-icon">{{ expandedGroups.baseline ? '▼' : '▶' }}</span>
                      <span class="group-title">基线校正</span>
                    </div>
                    <div v-show="expandedGroups.baseline" class="group-content">
                      <div class="config-item">
                        <label class="config-label">校正方法</label>
                        <el-select v-model="preprocessConfig.baseline.method" @change="handleConfigChange">
                          <el-option label="多项式拟合" value="polynomial" />
                          <el-option label="自适应迭代加权 (ALS)" value="als" />
                          <el-option label="不对称最小二乘法" value="asls" />
                          <el-option label="白化端点连接" value="whittaker" />
                        </el-select>
                      </div>
                      <div class="config-item" v-if="preprocessConfig.baseline.method === 'polynomial'">
                        <label class="config-label">多项式阶数</label>
                        <el-input-number v-model="preprocessConfig.baseline.order" :min="1" :max="10" />
                      </div>
                      <div class="config-item" v-if="preprocessConfig.baseline.method === 'als' || preprocessConfig.baseline.method === 'asls'">
                        <label class="config-label">迭代次数</label>
                        <el-input-number v-model="preprocessConfig.baseline.iterations" :min="10" :max="200" :step="10" />
                      </div>
                    </div>
                  </div>

                  <!-- 去噪处理 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('denoise')">
                      <span class="group-icon">{{ expandedGroups.denoise ? '▼' : '▶' }}</span>
                      <span class="group-title">去噪处理</span>
                    </div>
                    <div v-show="expandedGroups.denoise" class="group-content">
                      <div class="config-item">
                        <label class="config-label">去噪方法</label>
                        <el-select v-model="preprocessConfig.denoise.method" @change="handleConfigChange">
                          <el-option label="小波变换" value="wavelet" />
                          <el-option label="Savitzky-Golay 滤波" value="sg" />
                          <el-option label="中值滤波" value="median" />
                          <el-option label="高斯滤波" value="gaussian" />
                        </el-select>
                      </div>
                      <div class="config-item" v-if="preprocessConfig.denoise.method === 'sg'">
                        <label class="config-label">窗口大小</label>
                        <el-input-number v-model="preprocessConfig.denoise.windowSize" :min="3" :max="51" :step="2" />
                      </div>
                      <div class="config-item" v-if="preprocessConfig.denoise.method === 'wavelet'">
                        <label class="config-label">小波类型</label>
                        <el-select v-model="preprocessConfig.denoise.waveletType">
                          <el-option label="Daubechies (db4)" value="db4" />
                          <el-option label="Symlets (sym8)" value="sym8" />
                          <el-option label="Coiflets (coif3)" value="coif3" />
                        </el-select>
                      </div>
                    </div>
                  </div>

                  <!-- 归一化方法 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('normalize')">
                      <span class="group-icon">{{ expandedGroups.normalize ? '▼' : '▶' }}</span>
                      <span class="group-title">归一化方法</span>
                    </div>
                    <div v-show="expandedGroups.normalize" class="group-content">
                      <div class="config-item">
                        <label class="config-label">归一化类型</label>
                        <el-select v-model="preprocessConfig.normalize.method" @change="handleConfigChange">
                          <el-option label="向量归一化 (L2)" value="l2" />
                          <el-option label="最大最小值归一化" value="minmax" />
                          <el-option label="面积归一化" value="area" />
                          <el-option label="标准化 (Z-score)" value="zscore" />
                        </el-select>
                      </div>
                    </div>
                  </div>

                  <!-- 峰识别与提取 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('peak')">
                      <span class="group-icon">{{ expandedGroups.peak ? '▼' : '▶' }}</span>
                      <span class="group-title">峰识别与提取</span>
                    </div>
                    <div v-show="expandedGroups.peak" class="group-content">
                      <div class="config-item">
                        <label class="config-label">识别方法</label>
                        <el-select v-model="preprocessConfig.peak.method" @change="handleConfigChange">
                          <el-option label="二阶导数法" value="derivative" />
                          <el-option label="连续小波变换 (CWT)" value="cwt" />
                          <el-option label="高斯拟合" value="gaussian" />
                          <el-option label="局部极大值" value="local_max" />
                        </el-select>
                      </div>
                      <div class="config-item">
                        <label class="config-label">最小峰高</label>
                        <el-slider v-model="preprocessConfig.peak.minHeight" :min="0" :max="100" />
                      </div>
                      <div class="config-item">
                        <label class="config-label">最小峰距</label>
                        <el-input-number v-model="preprocessConfig.peak.minDistance" :min="1" :max="50" />
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 机器学习 Tab -->
              <el-tab-pane label="机器学习" name="ml">
                <div class="config-section">
                  <!-- 分类识别 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('classification')">
                      <span class="group-icon">{{ expandedGroups.classification ? '▼' : '▶' }}</span>
                      <span class="group-title">分类识别</span>
                    </div>
                    <div v-show="expandedGroups.classification" class="group-content">
                      <div class="config-item">
                        <label class="config-label">分类算法</label>
                        <el-select v-model="mlConfig.classification.algorithm" @change="handleConfigChange">
                          <el-option label="支持向量机 (SVM)" value="svm" />
                          <el-option label="随机森林 (RF)" value="rf" />
                          <el-option label="XGBoost" value="xgboost" />
                          <el-option label="深度学习分类器" value="dnn" />
                        </el-select>
                      </div>

                      <div class="config-item" v-if="mlConfig.classification.algorithm === 'svm'">
                        <label class="config-label">核函数</label>
                        <el-select v-model="mlConfig.classification.kernel">
                          <el-option label="RBF (径向基)" value="rbf" />
                          <el-option label="Linear (线性)" value="linear" />
                          <el-option label="Poly (多项式)" value="poly" />
                          <el-option label="Sigmoid" value="sigmoid" />
                        </el-select>
                      </div>

                      <div class="config-item" v-if="mlConfig.classification.algorithm === 'rf' || mlConfig.classification.algorithm === 'xgboost'">
                        <label class="config-label">树数量</label>
                        <el-input-number v-model="mlConfig.classification.trees" :min="10" :max="500" :step="10" />
                      </div>

                      <div class="config-item">
                        <label class="config-label">训练集比例 {{ mlConfig.classification.trainRatio }}%</label>
                        <el-slider v-model="mlConfig.classification.trainRatio" :min="50" :max="90" />
                      </div>
                    </div>
                  </div>

                  <!-- 聚类分析 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('clustering')">
                      <span class="group-icon">{{ expandedGroups.clustering ? '▼' : '▶' }}</span>
                      <span class="group-title">聚类分析</span>
                    </div>
                    <div v-show="expandedGroups.clustering" class="group-content">
                      <div class="config-item">
                        <label class="config-label">聚类算法</label>
                        <el-select v-model="mlConfig.clustering.algorithm" @change="handleConfigChange">
                          <el-option label="K-means" value="kmeans" />
                          <el-option label="层次聚类" value="hierarchical" />
                          <el-option label="DBSCAN" value="dbscan" />
                          <el-option label="高斯混合模型 (GMM)" value="gmm" />
                        </el-select>
                      </div>

                      <div class="config-item" v-if="mlConfig.clustering.algorithm === 'kmeans' || mlConfig.clustering.algorithm === 'gmm'">
                        <label class="config-label">聚类数 K</label>
                        <el-input-number v-model="mlConfig.clustering.clusters" :min="2" :max="10" />
                      </div>

                      <div class="config-item" v-if="mlConfig.clustering.algorithm === 'dbscan'">
                        <label class="config-label">邻域半径 (ε)</label>
                        <el-input-number v-model="mlConfig.clustering.eps" :min="0.1" :max="5" :step="0.1" :precision="1" />
                      </div>
                    </div>
                  </div>

                  <!-- 回归分析 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('regression')">
                      <span class="group-icon">{{ expandedGroups.regression ? '▼' : '▶' }}</span>
                      <span class="group-title">回归分析</span>
                    </div>
                    <div v-show="expandedGroups.regression" class="group-content">
                      <div class="config-item">
                        <label class="config-label">回归算法</label>
                        <el-select v-model="mlConfig.regression.algorithm" @change="handleConfigChange">
                          <el-option label="PLS 回归" value="pls" />
                          <el-option label="神经网络回归" value="nn" />
                          <el-option label="高斯过程回归" value="gpr" />
                          <el-option label="支持向量回归 (SVR)" value="svr" />
                        </el-select>
                      </div>

                      <div class="config-item" v-if="mlConfig.regression.algorithm === 'pls'">
                        <label class="config-label">主成分数量</label>
                        <el-input-number v-model="mlConfig.regression.components" :min="1" :max="20" />
                      </div>
                    </div>
                  </div>

                  <!-- 降维可视化 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('dimension')">
                      <span class="group-icon">{{ expandedGroups.dimension ? '▼' : '▶' }}</span>
                      <span class="group-title">降维可视化</span>
                    </div>
                    <div v-show="expandedGroups.dimension" class="group-content">
                      <div class="config-item">
                        <label class="config-label">降维算法</label>
                        <el-select v-model="mlConfig.dimension.algorithm" @change="handleDimensionChange">
                          <el-option label="PCA (主成分分析)" value="pca" />
                          <el-option label="t-SNE" value="tsne" />
                          <el-option label="UMAP" value="umap" />
                          <el-option label="LDA (线性判别分析)" value="lda" />
                        </el-select>
                      </div>

                      <div class="config-item" v-if="mlConfig.dimension.algorithm === 'tsne'">
                        <label class="config-label">困惑度 (Perplexity)</label>
                        <el-input-number v-model="mlConfig.dimension.perplexity" :min="5" :max="50" />
                      </div>

                      <div class="config-item" v-if="mlConfig.dimension.algorithm === 'umap'">
                        <label class="config-label">邻居数量</label>
                        <el-input-number v-model="mlConfig.dimension.neighbors" :min="5" :max="50" />
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 深度学习 Tab -->
              <el-tab-pane label="深度学习" name="dl">
                <div class="config-section">
                  <!-- 预训练模型选择 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('pretrained')">
                      <span class="group-icon">{{ expandedGroups.pretrained ? '▼' : '▶' }}</span>
                      <span class="group-title">预训练模型选择</span>
                    </div>
                    <div v-show="expandedGroups.pretrained" class="group-content">
                      <div class="config-item">
                        <label class="config-label">模型架构</label>
                        <el-select v-model="dlConfig.pretrained.model" @change="handleConfigChange">
                          <el-option label="ResNet-50" value="resnet50" />
                          <el-option label="ResNet-101" value="resnet101" />
                          <el-option label="CNN (卷积神经网络)" value="cnn" />
                          <el-option label="Transformer" value="transformer" />
                          <el-option label="Vision Transformer (ViT)" value="vit" />
                          <el-option label="EfficientNet" value="efficientnet" />
                        </el-select>
                      </div>

                      <div class="config-item">
                        <label class="config-label">预训练权重</label>
                        <el-select v-model="dlConfig.pretrained.weights">
                          <el-option label="ImageNet" value="imagenet" />
                          <el-option label="COCO" value="coco" />
                          <el-option label="随机初始化" value="random" />
                        </el-select>
                      </div>
                    </div>
                  </div>

                  <!-- 迁移学习配置 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('transfer')">
                      <span class="group-icon">{{ expandedGroups.transfer ? '▼' : '▶' }}</span>
                      <span class="group-title">迁移学习配置</span>
                    </div>
                    <div v-show="expandedGroups.transfer" class="group-content">
                      <div class="config-item">
                        <label class="config-label">训练策略</label>
                        <el-switch
                          v-model="dlConfig.transfer.freezeBackbone"
                          active-text="冻结骨干网络"
                          inactive-text="全局微调"
                        />
                      </div>

                      <div class="config-item" v-if="dlConfig.transfer.freezeBackbone">
                        <label class="config-label">冻结层数</label>
                        <el-slider
                          v-model="dlConfig.transfer.frozenLayers"
                          :min="0"
                          :max="100"
                          :marks="{ 0: '0', 50: '50%', 100: '100%' }"
                        />
                      </div>

                      <div class="config-item">
                        <label class="config-label">微调学习率</label>
                        <el-input-number
                          v-model="dlConfig.transfer.fineTuneLR"
                          :min="0.00001"
                          :max="0.01"
                          :step="0.00001"
                          :precision="5"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 训练超参数 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('hyperparams')">
                      <span class="group-icon">{{ expandedGroups.hyperparams ? '▼' : '▶' }}</span>
                      <span class="group-title">训练超参数</span>
                    </div>
                    <div v-show="expandedGroups.hyperparams" class="group-content">
                      <div class="config-item">
                        <label class="config-label">训练轮数 (Epoch)</label>
                        <el-input-number v-model="dlConfig.hyperparams.epochs" :min="1" :max="200" />
                      </div>

                      <div class="config-item">
                        <label class="config-label">批次大小 (Batch Size)</label>
                        <el-select v-model="dlConfig.hyperparams.batchSize">
                          <el-option label="8" :value="8" />
                          <el-option label="16" :value="16" />
                          <el-option label="32" :value="32" />
                          <el-option label="64" :value="64" />
                          <el-option label="128" :value="128" />
                        </el-select>
                      </div>

                      <div class="config-item">
                        <label class="config-label">学习率</label>
                        <el-input-number
                          v-model="dlConfig.hyperparams.learningRate"
                          :min="0.0001"
                          :max="0.1"
                          :step="0.0001"
                          :precision="4"
                        />
                      </div>

                      <div class="config-item">
                        <label class="config-label">优化器</label>
                        <el-select v-model="dlConfig.hyperparams.optimizer">
                          <el-option label="Adam" value="adam" />
                          <el-option label="SGD" value="sgd" />
                          <el-option label="AdamW" value="adamw" />
                          <el-option label="RMSprop" value="rmsprop" />
                        </el-select>
                      </div>

                      <div class="config-item">
                        <label class="config-label">学习率调度器</label>
                        <el-select v-model="dlConfig.hyperparams.scheduler">
                          <el-option label="无" value="none" />
                          <el-option label="StepLR" value="step" />
                          <el-option label="CosineAnnealing" value="cosine" />
                          <el-option label="ReduceLROnPlateau" value="plateau" />
                        </el-select>
                      </div>
                    </div>
                  </div>

                  <!-- 自定义模型上传 -->
                  <div class="algorithm-group">
                    <div class="group-header" @click="toggleGroup('custom')">
                      <span class="group-icon">{{ expandedGroups.custom ? '▼' : '▶' }}</span>
                      <span class="group-title">自定义模型上传</span>
                    </div>
                    <div v-show="expandedGroups.custom" class="group-content">
                      <div class="config-item">
                        <label class="config-label">模型文件</label>
                        <el-upload
                          class="model-uploader"
                          :on-change="handleModelUpload"
                          :auto-upload="false"
                          :show-file-list="true"
                          accept=".pth,.pt,.h5,.onnx"
                        >
                          <el-button type="primary" class="upload-btn">
                            <span>📁 选择模型文件</span>
                          </el-button>
                        </el-upload>
                      </div>

                      <div class="config-item" v-if="dlConfig.custom.uploadedModel">
                        <label class="config-label">模型信息</label>
                        <div class="model-info">
                          <div class="info-item">
                            <span class="info-label">文件名:</span>
                            <span class="info-value">{{ dlConfig.custom.uploadedModel }}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-label">状态:</span>
                            <span class="info-value status-ready">✓ 已加载</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 训练按钮 -->
            <div class="train-button-wrapper">
              <button
                class="train-button"
                :class="{ 'training': isTraining }"
                @click="startTraining"
              >
                <span v-if="!isTraining">🚀 开始训练</span>
                <span v-else>⏸️ 训练中...</span>
              </button>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 中间面板 - 降维可视化与训练监控 -->
      <div class="center-panel">
        <!-- 降维可视化 -->
        <div class="visualization-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">
                  降维可视化 - {{ mlConfig.dimension.algorithm.toUpperCase() }}
                </span>
                <div class="control-buttons">
                  <el-button size="small" @click="refreshVisualization" class="refresh-btn">
                    🔄 刷新
                  </el-button>
                </div>
              </div>
              <div ref="scatterChartRef" class="chart-container"></div>
            </div>
          </dv-border-box-13>
        </div>

        <!-- 训练监控 -->
        <div class="monitoring-section">
          <dv-border-box-13>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">实时训练监控</span>
                <span class="status-indicator" :class="{ active: isTraining }">
                  {{ isTraining ? '● 训练中' : '○ 待机' }}
                </span>
              </div>
              <div ref="trainingChartRef" class="chart-container"></div>
            </div>
          </dv-border-box-13>
        </div>
      </div>

      <!-- 右侧面板 - 评估与资源 -->
      <div class="right-panel">
        <!-- 模型性能雷达图 -->
        <div class="performance-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">模型性能评估</span>
              </div>
              <div ref="radarChartRef" class="chart-container-small"></div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 训练日志 -->
        <div class="log-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">训练日志</span>
                <el-button size="small" @click="clearLogs" class="clear-btn">
                  🗑️ 清空
                </el-button>
              </div>
              <div class="log-container">
                <div
                  v-for="(log, index) in trainingLogs"
                  :key="index"
                  class="log-item"
                  :class="log.type"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 资源监控 -->
        <div class="resource-section">
          <dv-border-box-12>
            <div class="panel-content">
              <div class="panel-title">
                <span class="title-text">资源监控</span>
              </div>
              <div class="resource-container">
                <div class="resource-item">
                  <div class="resource-label">GPU 占用率</div>
                  <el-progress
                    :percentage="resourceUsage.gpu"
                    :color="getProgressColor(resourceUsage.gpu)"
                    :stroke-width="12"
                  />
                  <div class="resource-value">{{ resourceUsage.gpu }}%</div>
                </div>
                <div class="resource-item">
                  <div class="resource-label">显存占用</div>
                  <el-progress
                    :percentage="resourceUsage.memory"
                    :color="getProgressColor(resourceUsage.memory)"
                    :stroke-width="12"
                  />
                  <div class="resource-value">{{ resourceUsage.memory }}%</div>
                </div>
                <div class="resource-item">
                  <div class="resource-label">CPU 占用率</div>
                  <el-progress
                    :percentage="resourceUsage.cpu"
                    :color="getProgressColor(resourceUsage.cpu)"
                    :stroke-width="12"
                  />
                  <div class="resource-value">{{ resourceUsage.cpu }}%</div>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { BorderBox12 as DvBorderBox12, BorderBox13 as DvBorderBox13 } from '@kjgl77/datav-vue3'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import NavBar from '@/components/NavBar.vue'

export default defineComponent({
  name: 'ModelLab',
  components: {
    DvBorderBox12,
    DvBorderBox13,
    NavBar
  },
  setup() {
    // Tab 状态
    const activeTab = ref('preprocess')
    const isTraining = ref(false)

    // 折叠组管理
    const expandedGroups = ref({
      baseline: true,
      denoise: false,
      normalize: false,
      peak: false,
      classification: true,
      clustering: false,
      regression: false,
      dimension: true,
      pretrained: true,
      transfer: false,
      hyperparams: false,
      custom: false
    })

    // 预处理配置
    const preprocessConfig = ref({
      baseline: {
        method: 'polynomial',
        order: 3,
        iterations: 100
      },
      denoise: {
        method: 'sg',
        windowSize: 11,
        waveletType: 'db4'
      },
      normalize: {
        method: 'l2'
      },
      peak: {
        method: 'derivative',
        minHeight: 50,
        minDistance: 10
      }
    })

    // 机器学习配置
    const mlConfig = ref({
      classification: {
        algorithm: 'svm',
        kernel: 'rbf',
        trees: 100,
        trainRatio: 80
      },
      clustering: {
        algorithm: 'kmeans',
        clusters: 3,
        eps: 0.5
      },
      regression: {
        algorithm: 'pls',
        components: 5
      },
      dimension: {
        algorithm: 'pca',
        perplexity: 30,
        neighbors: 15
      }
    })

    // 深度学习配置
    const dlConfig = ref({
      pretrained: {
        model: 'resnet50',
        weights: 'imagenet'
      },
      transfer: {
        freezeBackbone: true,
        frozenLayers: 80,
        fineTuneLR: 0.0001
      },
      hyperparams: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
        scheduler: 'cosine'
      },
      custom: {
        uploadedModel: ''
      }
    })

    // 训练日志
    const trainingLogs = ref([
      { time: '14:32:01', message: '系统初始化完成...', type: 'info' },
      { time: '14:32:05', message: '数据预处理中...', type: 'info' },
      { time: '14:32:10', message: '模型加载成功', type: 'success' }
    ])

    // 资源使用
    const resourceUsage = ref({
      gpu: 45,
      memory: 62,
      cpu: 38
    })

    // 图表引用
    const scatterChartRef = ref<HTMLElement | null>(null)
    const trainingChartRef = ref<HTMLElement | null>(null)
    const radarChartRef = ref<HTMLElement | null>(null)

    let scatterChart: ECharts | null = null
    let trainingChart: ECharts | null = null
    let radarChart: ECharts | null = null
    let trainingInterval: number | null = null
    let resourceInterval: number | null = null

    // 切换折叠组
    const toggleGroup = (groupName: keyof typeof expandedGroups.value) => {
      expandedGroups.value[groupName] = !expandedGroups.value[groupName]
    }

    // 生成模拟散点数据
    const generateScatterData = () => {
      const data: any[] = []
      const categories = ['类别 A', '类别 B', '类别 C', '类别 D']
      const colors = ['#00e5ff', '#00ff7f', '#ff6b00', '#ff00ff']

      categories.forEach((category, index) => {
        const categoryData: number[][] = []
        const centerX = (index - 1.5) * 25
        const centerY = (index - 1.5) * 20

        for (let i = 0; i < 80; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 15 + 8
          const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 8
          const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 8
          categoryData.push([Number(x.toFixed(2)), Number(y.toFixed(2))])
        }

        data.push({
          name: category,
          data: categoryData,
          color: colors[index]
        })
      })

      return data
    }

    // 初始化散点图
    const initScatterChart = () => {
      if (!scatterChartRef.value) return

      scatterChart = echarts.init(scatterChartRef.value)
      const scatterData = generateScatterData()

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 21, 41, 0.95)',
          borderColor: '#00e5ff',
          borderWidth: 2,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13
          },
          formatter: (params: any) => {
            return `
              <div style="padding: 8px;">
                <div style="color: #00ff7f; font-weight: bold; margin-bottom: 5px;">
                  ${params.seriesName}
                </div>
                <div style="color: #00e5ff;">
                  坐标: (${params.data[0]}, ${params.data[1]})
                </div>
              </div>
            `
          }
        },
        legend: {
          data: scatterData.map(d => d.name),
          top: 10,
          right: 20,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13,
            fontWeight: 'bold'
          },
          itemGap: 20
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '12%'
        },
        xAxis: {
          type: 'value',
          name: '主成分 1',
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
              color: 'rgba(0, 229, 255, 0.15)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '主成分 2',
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
              color: 'rgba(0, 229, 255, 0.15)'
            }
          }
        },
        series: scatterData.map(item => ({
          name: item.name,
          type: 'scatter',
          data: item.data,
          symbolSize: 10,
          itemStyle: {
            color: item.color,
            shadowBlur: 12,
            shadowColor: item.color
          }
        }))
      }

      scatterChart.setOption(option)
    }

    // 初始化训练监控图表
    const initTrainingChart = () => {
      if (!trainingChartRef.value) return

      trainingChart = echarts.init(trainingChartRef.value)

      const epochs = Array.from({ length: 50 }, (_, i) => i + 1)
      const lossData = epochs.map(x => Number((1 / (x * 0.3 + 1) + Math.random() * 0.05).toFixed(4)))
      const accData = epochs.map(x => Number((1 - 1 / (x * 0.2 + 1) + Math.random() * 0.02).toFixed(4)))

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 21, 41, 0.95)',
          borderColor: '#00e5ff',
          borderWidth: 2,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13
          },
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: '#00e5ff',
              width: 1,
              type: 'dashed'
            }
          }
        },
        legend: {
          data: ['Loss', 'Accuracy'],
          top: 10,
          right: 20,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13,
            fontWeight: 'bold'
          },
          itemGap: 20
        },
        grid: {
          left: '12%',
          right: '8%',
          top: '20%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: epochs,
          name: 'Epoch',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 13,
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
            fontSize: 11,
            interval: 9
          }
        },
        yAxis: {
          type: 'value',
          name: 'Value',
          nameTextStyle: {
            color: '#00e5ff',
            fontSize: 13,
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
            fontSize: 11
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.15)'
            }
          }
        },
        series: [
          {
            name: 'Loss',
            type: 'line',
            data: lossData,
            smooth: true,
            lineStyle: {
              color: '#ff6b00',
              width: 3,
              shadowBlur: 10,
              shadowColor: '#ff6b00'
            },
            itemStyle: {
              color: '#ff6b00'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 107, 0, 0.3)' },
                { offset: 1, color: 'rgba(255, 107, 0, 0.05)' }
              ])
            }
          },
          {
            name: 'Accuracy',
            type: 'line',
            data: accData,
            smooth: true,
            lineStyle: {
              color: '#00ff7f',
              width: 3,
              shadowBlur: 10,
              shadowColor: '#00ff7f'
            },
            itemStyle: {
              color: '#00ff7f'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 255, 127, 0.3)' },
                { offset: 1, color: 'rgba(0, 255, 127, 0.05)' }
              ])
            }
          }
        ]
      }

      trainingChart.setOption(option)
    }

    // 初始化雷达图
    const initRadarChart = () => {
      if (!radarChartRef.value) return

      radarChart = echarts.init(radarChartRef.value)

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 21, 41, 0.95)',
          borderColor: '#00e5ff',
          borderWidth: 2,
          textStyle: {
            color: '#00e5ff',
            fontSize: 13
          }
        },
        radar: {
          indicator: [
            { name: '准确率', max: 100 },
            { name: '召回率', max: 100 },
            { name: 'F1 分数', max: 100 },
            { name: '训练速度', max: 100 },
            { name: '推理速度', max: 100 }
          ],
          radius: '70%',
          splitNumber: 4,
          name: {
            textStyle: {
              color: '#00e5ff',
              fontSize: 13,
              fontWeight: 'bold'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.4)',
              width: 2
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.3)',
              width: 2
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(0, 229, 255, 0.08)', 'rgba(0, 229, 255, 0.15)']
            }
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [92, 88, 90, 75, 85],
                name: '当前模型',
                areaStyle: {
                  color: 'rgba(0, 229, 255, 0.4)'
                },
                lineStyle: {
                  color: '#00e5ff',
                  width: 3,
                  shadowBlur: 10,
                  shadowColor: '#00e5ff'
                },
                itemStyle: {
                  color: '#00e5ff',
                  borderWidth: 2,
                  borderColor: '#fff'
                }
              }
            ]
          }
        ]
      }

      radarChart.setOption(option)
    }

    // 处理配置变化
    const handleConfigChange = () => {
      addLog('配置已更新', 'info')
    }

    // 处理降维方法变化
    const handleDimensionChange = () => {
      refreshVisualization()
      addLog(`切换降维算法: ${mlConfig.value.dimension.algorithm.toUpperCase()}`, 'info')
    }

    // 刷新可视化
    const refreshVisualization = () => {
      if (scatterChart) {
        const newData = generateScatterData()
        scatterChart.setOption({
          series: newData.map(item => ({
            data: item.data
          }))
        })
        addLog('降维可视化已刷新', 'success')
      }
    }

    // 处理模型上传
    const handleModelUpload = (file: any) => {
      dlConfig.value.custom.uploadedModel = file.name
      addLog(`模型文件已上传: ${file.name}`, 'success')
    }

    // 开始训练
    const startTraining = () => {
      isTraining.value = !isTraining.value

      if (isTraining.value) {
        addLog('开始训练...', 'info')
        let epoch = 1

        trainingInterval = window.setInterval(() => {
          const time = new Date().toLocaleTimeString()
          const loss = (Math.random() * 0.1).toFixed(4)
          const acc = (0.85 + Math.random() * 0.1).toFixed(4)

          trainingLogs.value.unshift({
            time,
            message: `Epoch ${epoch}/50 - loss: ${loss}, accuracy: ${acc}`,
            type: 'info'
          })

          if (trainingLogs.value.length > 10) {
            trainingLogs.value.pop()
          }

          epoch++
          if (epoch > 50) {
            epoch = 1
            addLog('训练完成！', 'success')
          }
        }, 2000)

        resourceInterval = window.setInterval(() => {
          resourceUsage.value.gpu = Math.min(95, Math.floor(60 + Math.random() * 25))
          resourceUsage.value.memory = Math.min(95, Math.floor(70 + Math.random() * 20))
          resourceUsage.value.cpu = Math.min(90, Math.floor(50 + Math.random() * 30))
        }, 3000)
      } else {
        if (trainingInterval) clearInterval(trainingInterval)
        if (resourceInterval) clearInterval(resourceInterval)
        resourceUsage.value.gpu = 45
        resourceUsage.value.memory = 62
        resourceUsage.value.cpu = 38
        addLog('训练已暂停', 'warning')
      }
    }

    // 添加日志
    const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const time = new Date().toLocaleTimeString()
      trainingLogs.value.unshift({ time, message, type })
      if (trainingLogs.value.length > 10) {
        trainingLogs.value.pop()
      }
    }

    // 清空日志
    const clearLogs = () => {
      trainingLogs.value = []
      addLog('日志已清空', 'info')
    }

    // 进度条颜色
    const getProgressColor = (percentage: number): string => {
      if (percentage < 60) return '#00ff7f'
      if (percentage < 80) return '#00e5ff'
      return '#ff6b00'
    }

    // 窗口resize处理
    const handleResize = () => {
      scatterChart?.resize()
      trainingChart?.resize()
      radarChart?.resize()
    }

    onMounted(() => {
      nextTick(() => {
        initScatterChart()
        initTrainingChart()
        initRadarChart()
        window.addEventListener('resize', handleResize)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      scatterChart?.dispose()
      trainingChart?.dispose()
      radarChart?.dispose()
      if (trainingInterval) clearInterval(trainingInterval)
      if (resourceInterval) clearInterval(resourceInterval)
    })

    return {
      activeTab,
      isTraining,
      expandedGroups,
      preprocessConfig,
      mlConfig,
      dlConfig,
      trainingLogs,
      resourceUsage,
      scatterChartRef,
      trainingChartRef,
      radarChartRef,
      toggleGroup,
      handleConfigChange,
      handleDimensionChange,
      handleModelUpload,
      refreshVisualization,
      startTraining,
      clearLogs,
      getProgressColor
    }
  }
})
</script>

<style lang="scss" scoped>
// ========== 页面容器 ==========
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #001529 0%, #002140 50%, #001529 100%);
  position: relative;

  // 科技感背景网格
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

// ========== 主内容区 ==========
.main-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-height: 0;
}

// ========== 左侧面板 ==========
.left-panel {
  flex: 0 0 28%;
  min-width: 350px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.4);
    flex-shrink: 0;

    .title-text {
      font-size: 19px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
      letter-spacing: 2px;
    }

    .title-icon {
      font-size: 24px;
      filter: drop-shadow(0 0 8px #00e5ff);
    }
  }

  .config-section {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #00e5ff, #00a8cc);
      border-radius: 4px;
      box-shadow: 0 0 6px #00e5ff;
    }
  }

  // 算法分组
  .algorithm-group {
    margin-bottom: 15px;
    background: rgba(0, 229, 255, 0.03);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: rgba(0, 229, 255, 0.4);
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
    }

    .group-header {
      padding: 12px 15px;
      background: rgba(0, 229, 255, 0.08);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 229, 255, 0.15);
      }

      .group-icon {
        color: #00ff7f;
        font-size: 12px;
        text-shadow: 0 0 5px #00ff7f;
      }

      .group-title {
        font-size: 15px;
        font-weight: bold;
        color: #00e5ff;
        text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
        letter-spacing: 1px;
      }
    }

    .group-content {
      padding: 15px;
    }
  }

  .config-item {
    margin-bottom: 18px;

    &:last-child {
      margin-bottom: 0;
    }

    .config-label {
      display: block;
      margin-bottom: 10px;
      font-size: 13px;
      color: #00e5ff;
      text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }

  // 模型信息
  .model-info {
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 6px;
    padding: 12px;

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 229, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        color: rgba(0, 229, 255, 0.7);
        font-size: 12px;
      }

      .info-value {
        color: #00e5ff;
        font-size: 12px;
        font-weight: bold;

        &.status-ready {
          color: #00ff7f;
          text-shadow: 0 0 8px rgba(0, 255, 127, 0.5);
        }
      }
    }
  }

  .train-button-wrapper {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid rgba(0, 229, 255, 0.3);
    flex-shrink: 0;
  }

  .train-button {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #00e5ff 0%, #00a8cc 100%);
    border: none;
    border-radius: 8px;
    color: #001529;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      0 0 20px rgba(0, 229, 255, 0.5),
      0 5px 15px rgba(0, 229, 255, 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transform: rotate(45deg);
      transition: all 0.5s;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 0 30px rgba(0, 229, 255, 0.8),
        0 8px 20px rgba(0, 229, 255, 0.4),
        inset 0 0 15px rgba(255, 255, 255, 0.3);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &.training {
      background: linear-gradient(135deg, #ff6b00 0%, #cc5500 100%);
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(255, 107, 0, 0.5),
      0 5px 15px rgba(255, 107, 0, 0.3);
  }
  50% {
    box-shadow:
      0 0 30px rgba(255, 107, 0, 0.8),
      0 5px 20px rgba(255, 107, 0, 0.5);
  }
}

// ========== 中间面板 ==========
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
  min-height: 0;

  .visualization-section {
    flex: 1 1 58%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .monitoring-section {
    flex: 1 1 42%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.4);
    flex-shrink: 0;

    .title-text {
      font-size: 18px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff;
      letter-spacing: 2px;
    }

    .control-buttons {
      .refresh-btn {
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid #00e5ff;
        color: #00e5ff;
        font-size: 13px;
        padding: 6px 15px;
        transition: all 0.3s;

        &:hover {
          background: rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
          transform: translateY(-1px);
        }
      }
    }

    .status-indicator {
      font-size: 14px;
      color: #666;
      transition: all 0.3s;

      &.active {
        color: #00ff7f;
        text-shadow: 0 0 10px #00ff7f;
        animation: blink 2s infinite;
      }
    }
  }

  .chart-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

// ========== 右侧面板 ==========
.right-panel {
  flex: 0 0 26%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 300px;
  min-height: 0;

  .performance-section {
    flex: 1 1 32%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .log-section {
    flex: 1 1 38%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .resource-section {
    flex: 1 1 30%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .panel-title {
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.4);
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-text {
      font-size: 16px;
      font-weight: bold;
      color: #00e5ff;
      text-shadow: 0 0 10px #00e5ff;
      letter-spacing: 1px;
    }

    .clear-btn {
      background: rgba(255, 107, 0, 0.1);
      border: 1px solid #ff6b00;
      color: #ff6b00;
      font-size: 12px;
      padding: 4px 12px;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 107, 0, 0.2);
        box-shadow: 0 0 12px rgba(255, 107, 0, 0.4);
      }
    }
  }

  .chart-container-small {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  .log-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 229, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #00e5ff, #00a8cc);
      border-radius: 4px;
      box-shadow: 0 0 6px #00e5ff;
    }

    .log-item {
      padding: 10px 14px;
      margin-bottom: 10px;
      background: rgba(0, 229, 255, 0.05);
      border-left: 3px solid #00e5ff;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.6;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
        transform: translateX(3px);
      }

      &.success {
        border-left-color: #00ff7f;
        background: rgba(0, 255, 127, 0.05);
      }

      &.warning {
        border-left-color: #ff6b00;
        background: rgba(255, 107, 0, 0.05);
      }

      &.error {
        border-left-color: #ff0000;
        background: rgba(255, 0, 0, 0.05);
      }

      .log-time {
        color: #00ff7f;
        margin-right: 10px;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(0, 255, 127, 0.5);
      }

      .log-message {
        color: #00e5ff;
      }
    }
  }

  .resource-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;

    .resource-item {
      .resource-label {
        font-size: 13px;
        color: #00e5ff;
        margin-bottom: 10px;
        text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
        font-weight: 600;
      }

      .resource-value {
        text-align: right;
        margin-top: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #00ff7f;
        text-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
      }
    }
  }
}

// ========== Element Plus 组件样式 ==========
:deep(.el-tabs) {
  .el-tabs__header {
    margin-bottom: 15px;
  }

  .el-tabs__nav-wrap {
    &::after {
      background-color: rgba(0, 229, 255, 0.3);
    }
  }

  .el-tabs__item {
    color: #00e5ff;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;

    &:hover {
      color: #00ff7f;
    }

    &.is-active {
      color: #00ff7f;
      text-shadow: 0 0 10px #00ff7f;
    }
  }

  .el-tabs__active-bar {
    background-color: #00ff7f;
    box-shadow: 0 0 10px #00ff7f;
    height: 3px;
  }
}

:deep(.el-select) {
  width: 100%;

  .el-input__wrapper {
    background-color: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);
    box-shadow: none;
    transition: all 0.3s;

    &:hover {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }

    &.is-focus {
      border-color: #00ff7f;
      box-shadow: 0 0 15px rgba(0, 255, 127, 0.4);
    }

    .el-input__inner {
      color: #00e5ff;
      font-size: 13px;

      &::placeholder {
        color: rgba(0, 229, 255, 0.4);
      }
    }
  }
}

:deep(.el-input-number) {
  width: 100%;

  .el-input-number__decrease,
  .el-input-number__increase {
    background-color: rgba(0, 229, 255, 0.1);
    border-color: rgba(0, 229, 255, 0.3);
    color: #00e5ff;

    &:hover {
      background-color: rgba(0, 229, 255, 0.2);
      color: #00ff7f;
    }
  }

  .el-input__wrapper {
    background-color: rgba(0, 229, 255, 0.08);
    border: 1px solid rgba(0, 229, 255, 0.3);

    .el-input__inner {
      color: #00e5ff;
      text-align: center;
      font-size: 13px;
    }
  }
}

:deep(.el-switch) {
  .el-switch__core {
    background-color: rgba(0, 229, 255, 0.2);
    border: 1px solid rgba(0, 229, 255, 0.3);

    .el-switch__action {
      background-color: #00e5ff;
    }
  }

  &.is-checked {
    .el-switch__core {
      background-color: #00ff7f;
      border-color: #00ff7f;

      .el-switch__action {
        background-color: #fff;
      }
    }
  }

  .el-switch__label {
    color: #00e5ff;
    font-size: 12px;

    &.is-active {
      color: #00ff7f;
    }
  }
}

:deep(.el-slider) {
  .el-slider__runway {
    background-color: rgba(0, 229, 255, 0.2);
    height: 6px;
  }

  .el-slider__bar {
    background: linear-gradient(90deg, #00e5ff 0%, #00ff7f 100%);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  .el-slider__button {
    background-color: #00ff7f;
    border: 2px solid #001529;
    box-shadow:
      0 0 15px rgba(0, 255, 127, 0.8),
      0 0 5px rgba(0, 255, 127, 0.5);
    width: 16px;
    height: 16px;
  }

  .el-slider__marks-text {
    color: #00e5ff;
    font-size: 11px;
  }
}

:deep(.el-progress) {
  .el-progress-bar__outer {
    background-color: rgba(0, 229, 255, 0.15);
    border: 1px solid rgba(0, 229, 255, 0.25);
    border-radius: 6px;
    overflow: hidden;
  }

  .el-progress-bar__inner {
    border-radius: 6px;
    transition: all 0.4s ease;
  }

  .el-progress__text {
    color: #00e5ff;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
    font-size: 13px;
  }
}

:deep(.el-upload) {
  width: 100%;

  .upload-btn {
    width: 100%;
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid #00e5ff;
    color: #00e5ff;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 229, 255, 0.2);
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
      transform: translateY(-1px);
    }
  }
}

// ========== 响应式设计 ==========
@media screen and (max-width: 1600px) {
  .left-panel,
  .right-panel {
    min-width: 300px;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .left-panel,
  .right-panel,
  .center-panel {
    flex: 0 0 auto;
    width: 100%;
    min-width: auto;
    height: auto;
    min-height: 500px;
  }
}
</style>