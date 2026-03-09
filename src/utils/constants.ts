/**
 * API 常量定义
 */

// ========== API 路径常量 ==========
export const API_PATHS = {
  // 认证
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // 文件管理
  FILES: {
    LIST: '/api/files',
    UPLOAD: '/api/upload',
    DELETE: '/api/files',
    DETAIL: '/api/files/detail',
    RENAME: '/api/files/rename',
    MOVE: '/api/files/move',
    COPY: '/api/files/copy',
  },

  // 光谱分析
  ANALYSIS: {
    PEAKS: '/api/analysis/peaks',
    FIT_PEAKS: '/api/analysis/fit-peaks',
    PREDICT: '/api/analysis/predict',
    MATCH: '/api/analysis/match',
    BASELINE: '/api/analysis/baseline',
    SMOOTH: '/api/analysis/smooth',
    MODEL_STATUS: '/api/analysis/model/status',
    MODEL_RELOAD: '/api/analysis/model/reload',
  },

  // 数据处理
  PROCESS: {
    EXECUTE: '/api/process/execute',
    QUEUE: '/api/process/queue',
    CANCEL: '/api/process',
    STATUS: '/api/process/status',
  },

  // 定量分析
  QUANTITATIVE: {
    FIT: '/api/quantitative/fit',
    PREDICT: '/api/quantitative/predict',
    REPORT: '/api/quantitative/report',
  },

  // 导出
  EXPORT: {
    EXCEL: '/api/export/excel',
    PDF: '/api/export/pdf',
    WORD: '/api/export/word',
    TEMPLATE: '/api/export/excel/template',
  },

  // 报告
  REPORT: {
    GENERATE: '/api/report/generate',
    LIST: '/api/reports',
    DETAIL: '/api/reports',
    DELETE: '/api/reports',
  },

  // 数据统计
  STATS: {
    TODAY: '/api/stats/today',
    TOTAL: '/api/stats/total',
    WEEKLY: '/api/stats/weekly',
    MONTHLY: '/api/stats/monthly',
  },

  // 设备管理
  DEVICES: {
    LIST: '/api/devices',
    STATUS: '/api/device/status',
    SYNC: '/api/device/sync',
    CONFIG: '/api/device/config',
  },

  // 云端数据库
  CLOUD: {
    DATABASES: '/api/cloud/databases',
    IMPORT: '/api/cloud/import',
    EXPORT: '/api/cloud/export',
  },

  // 系统
  SYSTEM: {
    RESOURCES: '/api/system/resources',
    LOGS: '/api/system/logs',
    CONFIG: '/api/system/config',
  },

  // 用户
  USER: {
    INFO: '/api/user/info',
    UPDATE: '/api/user/update',
    AVATAR: '/api/user/avatar',
  },
} as const

// ========== 请求方法常量 ==========
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const

// ========== 文件类型常量 ==========
export const FILE_TYPES = {
  SPECTRUM: ['.spc', '.txt', '.csv', '.dat', '.mat'],
  IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  MODEL: ['.pth', '.pt', '.h5', '.onnx', '.pkl'],
} as const

// ==========  MIME 类型常量 ==========
export const MIME_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  OCTET_STREAM: 'application/octet-stream',
  PDF: 'application/pdf',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const

// ========== 状态码常量 ==========
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

// ========== 业务状态码常量 ==========
export const BUSINESS_CODES = {
  SUCCESS: 0,
  SUCCESS_WITH_MSG: 200,
  ERROR: -1,
  TOKEN_EXPIRED: 401,
  PERMISSION_DENIED: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  SERVER_ERROR: 500,
} as const

// ========== 元素符号常量 ==========
export const ELEMENTS = {
  COMMON: [
    { symbol: 'C', name: '碳', selected: true },
    { symbol: 'H', name: '氢', selected: true },
    { symbol: 'O', name: '氧', selected: true },
    { symbol: 'N', name: '氮', selected: true },
    { symbol: 'S', name: '硫', selected: false },
    { symbol: 'P', name: '磷', selected: false },
  ],
  ALL: [
    'C', 'H', 'O', 'N', 'S', 'P', 'Si', 'Cl', 'F', 'Br', 'I',
    'Na', 'K', 'Ca', 'Mg', 'Al', 'Fe', 'Cu', 'Zn', 'Mn', 'Cr',
    'Ni', 'Co', 'Ti', 'V', 'Mo', 'W', 'Ag', 'Au', 'Pt', 'Pd',
  ],
} as const

// ========== 预处理算法常量 ==========
export const PREPROCESS_ALGORITHMS = {
  BASELINE: {
    POLYNOMIAL: 'polynomial',
    ALS: 'als',
    ASLS: 'asls',
    WHITTAKER: 'whittaker',
  },
  DENOISE: {
    WAVELET: 'wavelet',
    SG: 'sg',
    MEDIAN: 'median',
    GAUSSIAN: 'gaussian',
  },
  NORMALIZE: {
    L2: 'l2',
    MINMAX: 'minmax',
    AREA: 'area',
    ZSCORE: 'zscore',
  },
  SMOOTH: {
    SG: 'savitzky_golay',
    MOVING_AVG: 'moving_average',
  },
} as const

// ========== 机器学习算法常量 ==========
export const ML_ALGORITHMS = {
  CLASSIFICATION: {
    SVM: 'svm',
    RF: 'rf',
    XGBOOST: 'xgboost',
    DNN: 'dnn',
  },
  CLUSTERING: {
    KMEANS: 'kmeans',
    HIERARCHICAL: 'hierarchical',
    DBSCAN: 'dbscan',
    GMM: 'gmm',
  },
  REGRESSION: {
    PLS: 'pls',
    NN: 'nn',
    GPR: 'gpr',
    SVR: 'svr',
  },
  DIMENSION_REDUCTION: {
    PCA: 'pca',
    TSNE: 'tsne',
    UMAP: 'umap',
    LDA: 'lda',
  },
} as const

// ========== 设备状态常量 ==========
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  ERROR: 'error',
} as const

// ========== 通知类型常量 ==========
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// ========== 默认配置常量 ==========
export const DEFAULT_CONFIG = {
  // 图表配置
  CHART: {
    X_MIN: 400,
    X_MAX: 4000,
    Y_MIN: -30,
    Y_MAX: 120,
    LINE_COLOR: '#ff4040',
    LINE_WIDTH: 1.5,
  },

  // 寻峰配置
  PEAK_FINDING: {
    SENSITIVITY: 1.0,
    MIN_PEAK_WIDTH: 3,
    MIN_PEAK_HEIGHT: 0,
  },

  // 上传配置
  UPLOAD: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ACCEPT: '.spc,.txt,.csv,.dat,.mat',
  },

  // 请求配置
  REQUEST: {
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
  },
} as const

// ========== 导出类型 ==========
export type ElementType = typeof ELEMENTS.ALL[number]
export type PreprocessAlgorithm =
  | typeof PREPROCESS_ALGORITHMS.BASELINE[keyof typeof PREPROCESS_ALGORITHMS.BASELINE]
  | typeof PREPROCESS_ALGORITHMS.DENOISE[keyof typeof PREPROCESS_ALGORITHMS.DENOISE]
  | typeof PREPROCESS_ALGORITHMS.NORMALIZE[keyof typeof PREPROCESS_ALGORITHMS.NORMALIZE]
  | typeof PREPROCESS_ALGORITHMS.SMOOTH[keyof typeof PREPROCESS_ALGORITHMS.SMOOTH]
export type DeviceStatusType = typeof DEVICE_STATUS[keyof typeof DEVICE_STATUS]
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
