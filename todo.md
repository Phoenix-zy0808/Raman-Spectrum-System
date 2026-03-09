智能拉曼光谱系统 - 前端开发规划与 Todo (v1.0)
一、 技术栈选型与核心依赖
为了配合 FastAPI 的高性能，并在工业级 Web 软件中保持极高的响应速度，前端采取纯 Vue 3 组合式 API (Composition API) 架构。

核心框架: Vue 3.3+ ( <script setup> 语法)

路由管理: Vue Router 4.x (静态路由 + 权限拦截)

状态管理: Pinia 2.x (核心！用于跨页面共享 file_id 和光谱数据状态)

UI 组件库: Element Plus (针对复杂表单、表格和抽屉面板)

可视化图表: ECharts 5.4+ (必须，用于渲染万级数据点的拉曼光谱图，开启 dataZoom 和 gl 渲染)

大屏装饰组件: DataV Vue3 (仅用于综合监控大屏的边框和动效)

网络请求: Axios 1.4+ (封装请求拦截器，统一注入 JWT Token)

二、 核心架构与状态流转设计
系统抛弃“页面刷新”的传统模式，采用 SPA (单页应用) 架构。

全局核心状态 (Pinia Store: useSpectrumStore):

state.currentToken: 保存 /login 接口返回的 JWT access_token。

state.currentFileId: 保存 /api/upload 接口返回的当前正在操作的 file_id。这是联动所有后续分析接口的关键钥匙。

state.rawSpectrumData: 保存原始的 (x, y) 波数与强度数组。

state.processedSpectrumData: 保存经过基线校正或滤波后的 (x, y) 数组。

三、 四大核心页面详细规划 (SPA 路由设计)
1. 综合监控大屏 (/dashboard)
定位: 系统的“门面”，用于商业展示、宏观统计和云边协同状态概览。

视觉规范: 暗黑科技风，全局采用 scale 等比缩放适配 1920x1080 屏幕。

核心组件与对接:

中央 3D 地图: 基于现有的地图数据文件构建，展示假设的边缘设备分布点。

今日处理总览: 展示云端吞吐量（需后端后续新增宏观统计 API）。

系统资源面板: 动态展示 CPU/内存的模拟状态，为后续真实的 IoT 监控留出 UI 槽位。

2. 光谱智能解析中心 (/workspace/analysis)
定位: 核心生产力工作台，处理单条数据的上传、可视化和定性寻峰。

视觉规范: IDE 式布局（左树、中图、下表、右控），采用 Flex 百分比布局，禁止全局缩放以保证图表和文字清晰度。

核心组件与真实 API 对接:

数据导入中心:

UI: 弹窗上传组件，支持 .txt 和 .csv。

对接: POST /api/upload，成功后将返回的 file_id 和 data_points 存入 Pinia。文件列表通过 GET /api/files 刷新。

中央光谱联动图 (ECharts):

UI: 支持双击放大、框选缩放、游标显示当前波数。

对接: 监听 Pinia 的数据变化，通过 setOption 实时重绘曲线。

智能寻峰与官能团匹配 (底部面板):

对接: POST /api/analysis/peaks。传入 file_id 和右侧面板勾选的元素范围，获取峰位 (如 464.52) 和振动类型 (如 "Si-O 伸缩振动") 并在表格中渲染。

高级峰值拟合:

对接: POST /api/analysis/fit-peaks。允许用户选择 gaussian、lorentzian 或 voigt 模型，将后端返回的拟合曲线叠加在原 ECharts 图表上。

3. AI 与定量分析实验室 (/workspace/ai-lab)
定位: 重型计算中心，负责数据的“清洗”和深度学习推理。

核心组件与真实 API 对接:

数据预处理流水线:

对接: POST /api/process/execute。

UI 提供三个主要功能块及参数表单：

SG 滤波: 配置 window (窗口大小) 和 polyorder (多项式阶数)。

基线校正 (asls): 配置 lam (平滑度) 和 p (不对称因子)。

归一化: 下拉选择 min-max、z-score 或 max。

交互: 处理完毕后，更新 Pinia 中的 processedSpectrumData，并在中央图表中对比展示“处理前 vs 处理后”的曲线。

AI 深度学习预测引擎:

对接: POST /api/analysis/predict。

UI: 提供一键预测按钮，将后端返回的 predicted_class (如“石英 (Quartz)”) 和 confidence (置信度) 以科技风卡片展示。同时调用 GET /api/analysis/model/status 在页面右上角显示当前 ONNX 模型的状态。

4. 云端资产与协作平台 (/workspace/assets)
定位: 商业闭环，完成数据导出和报告交付。

核心组件与真实 API 对接:

一键报告生成器:

对接: POST /api/export/excel (导出包含光谱数据、峰值和 AI 结果的表格)。

对接: POST /api/export/pdf (导出包含图表和表格的完整质检报告)。

UI: 提供“下载 Excel”、“下载 PDF”以及“下载模板文件 (GET /api/export/excel/template)”的操作卡片。

四、 阶段性落地路线图 (Execution Steps)
Phase 1: 基础设施打通 (预计 2 天)

搭建 Vue 3 工程，配置 Axios 请求拦截器处理 /login 的 JWT Token。

配置 Pinia Store，定义好 file_id 等核心状态变量。

Phase 2: 核心工作台联调 (预计 3 天)

完成 /workspace/analysis 的静态 UI（IDE 布局）。

对接 /api/upload 实现文件上传并在 ECharts 中画出初始曲线。

对接 /api/analysis/peaks 完成寻峰表格渲染。

Phase 3: AI 实验室与资产管理 (预计 3 天)

开发 /workspace/ai-lab 的表单，联调预处理算法 /api/process/execute，实现前后曲线对比。

联调 AI 预测接口和导出 Excel/PDF 接口。

Phase 4: 大屏开发与打磨 (预计 2 天)

利用 DataV 完善 /dashboard 页面的视觉效果。

处理全局的异常拦截（如 Token 过期踢回登录页、文件解析失败的弹窗提示）。