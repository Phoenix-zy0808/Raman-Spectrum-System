<template>
  <div class="file-uploader">
    <!-- 拖拽上传区域 -->
    <div
      class="upload-drop-zone"
      :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @drop.prevent="handleDrop"
      @click="handleClick"
    >
      <div class="upload-icon-wrapper">
        <svg class="upload-icon" viewBox="0 0 48 48" fill="none">
          <path d="M24 8V32M24 8L16 16M24 8L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 32V38C8 39.1046 8.89543 40 10 40H38C39.1046 40 40 39.1046 40 38V32" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <p class="upload-text">{{ uploadText }}</p>
      <div class="format-tags">
        <span v-for="format in acceptFormats" :key="format" class="format-tag">
          {{ format }}
        </span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptString"
      :multiple="multiple"
      :disabled="disabled"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div
        v-for="(file, index) in fileList"
        :key="index"
        class="file-item"
        :class="{ 'is-error': file.status === 'error', 'is-success': file.status === 'success' }"
      >
        <div class="file-info">
          <el-icon class="file-icon"><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <div class="file-status">
          <!-- 进度条 -->
          <div v-if="file.status === 'uploading'" class="progress-bar">
            <div
              class="progress-inner"
              :style="{ width: file.progress + '%' }"
            ></div>
          </div>
          <!-- 状态图标 -->
          <el-icon v-else-if="file.status === 'success'" class="status-icon success">
            <CircleCheck />
          </el-icon>
          <el-icon v-else-if="file.status === 'error'" class="status-icon error">
            <CircleClose />
          </el-icon>
          <!-- 操作按钮 -->
          <el-icon class="remove-btn" @click="removeFile(index)">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineExpose } from 'vue'
import { Document, CircleCheck, CircleClose, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ─────────────────────── Props ───────────────────────
interface UploadFile {
  raw: File
  name: string
  size: number
  status: 'ready' | 'uploading' | 'success' | 'error'
  progress: number
  response?: any
}

interface FileUploaderProps {
  accept?: string | string[]
  maxSize?: number // MB
  multiple?: boolean
  limit?: number
  disabled?: boolean
  uploadText?: string
  autoUpload?: boolean
  onUpload?: (file: File, onProgress: (percent: number) => void) => Promise<any>
}

const props = withDefaults(defineProps<FileUploaderProps>(), {
  accept: () => ['.txt', '.csv', '.spc', '.dat'],
  maxSize: 100,
  multiple: false,
  limit: 10,
  disabled: false,
  uploadText: '点击或拖拽文件到此处上传',
  autoUpload: true,
  onUpload: undefined,
})

// ─────────────────────── 状态 ───────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const fileList = ref<UploadFile[]>([])

// ─────────────────────── 计算属性 ───────────────────────
const acceptString = computed(() => {
  if (Array.isArray(props.accept)) {
    return props.accept.join(',')
  }
  return props.accept
})

const acceptFormats = computed(() => {
  if (Array.isArray(props.accept)) {
    return props.accept
  }
  return props.accept.split(',').map(s => s.trim())
})

// ─────────────────────── 方法 ───────────────────────
/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证文件
 */
const validateFile = (file: File): boolean => {
  // 检查文件类型
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExts = Array.isArray(props.accept) ? props.accept : props.accept.split(',')
  if (!allowedExts.includes(fileExt)) {
    ElMessage.error(`不支持的文件类型：${fileExt}`)
    return false
  }

  // 检查文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    ElMessage.error(`文件大小超过限制 (${props.maxSize}MB)`)
    return false
  }

  return true
}

/**
 * 处理文件选择
 */
const handleFiles = (files: FileList | File[]) => {
  const filesArray = Array.from(files)
  
  for (const file of filesArray) {
    if (!validateFile(file)) continue
    if (props.limit && fileList.value.length >= props.limit) {
      ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
      break
    }

    const uploadFile: UploadFile = {
      raw: file,
      name: file.name,
      size: file.size,
      status: 'ready',
      progress: 0,
    }

    fileList.value.push(uploadFile)

    if (props.autoUpload) {
      uploadFileFunc(uploadFile)
    }
  }
}

/**
 * 上传文件
 */
const uploadFileFunc = async (uploadFile: UploadFile) => {
  if (!props.onUpload) {
    uploadFile.status = 'success'
    uploadFile.progress = 100
    emit('success', uploadFile)
    return
  }

  uploadFile.status = 'uploading'

  try {
    const onProgress = (percent: number) => {
      uploadFile.progress = percent
    }

    const response = await props.onUpload(uploadFile.raw, onProgress)
    uploadFile.status = 'success'
    uploadFile.progress = 100
    uploadFile.response = response
    emit('success', uploadFile)
  } catch (error: any) {
    uploadFile.status = 'error'
    ElMessage.error(`上传失败：${error.message}`)
    emit('error', uploadFile, error)
  }
}

/**
 * 移除文件
 */
const removeFile = (index: number) => {
  const file = fileList.value[index]
  fileList.value.splice(index, 1)
  emit('remove', file)
}

/**
 * 清空文件列表
 */
const clearFiles = () => {
  fileList.value = []
}

/**
 * 手动上传
 */
const submit = () => {
  const readyFiles = fileList.value.filter(f => f.status === 'ready')
  for (const file of readyFiles) {
    uploadFileFunc(file)
  }
}

// ─────────────────────── 事件处理 ───────────────────────
const handleDragover = () => {
  if (!props.disabled) {
    isDragover.value = true
  }
}

const handleDragleave = () => {
  isDragover.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragover.value = false
  if (!props.disabled && e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

const handleClick = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    handleFiles(target.files)
  }
  target.value = ''
}

// ─────────────────────── 事件定义 ───────────────────────
const emit = defineEmits<{
  success: [file: UploadFile]
  error: [file: UploadFile, error: Error]
  remove: [file: UploadFile]
  change: [files: UploadFile[]]
}>()

// ─────────────────────── 暴露接口 ───────────────────────
defineExpose({
  fileList,
  clearFiles,
  submit,
  removeFile,
})
</script>

<style scoped lang="scss">
.file-uploader {
  width: 100%;
}

.upload-drop-zone {
  width: 100%;
  min-height: 180px;
  border: 2px dashed rgba(0, 246, 255, 0.38);
  border-radius: 8px;
  background: rgba(0, 21, 41, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    background: rgba(0, 21, 41, 0.8);
  }

  &.is-dragover {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
    transform: scale(1.02);
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.upload-icon-wrapper {
  margin-bottom: 16px;

  .upload-icon {
    width: 48px;
    height: 48px;
    color: #00c8ff;
  }
}

.upload-text {
  font-size: 14px;
  color: rgba(0, 200, 255, 0.85);
  margin-bottom: 12px;
}

.format-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.format-tag {
  padding: 4px 10px;
  background: rgba(0, 246, 255, 0.12);
  border: 1px solid rgba(0, 246, 255, 0.28);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(0, 200, 255, 0.78);
}

.file-list {
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 21, 41, 0.8);
  border: 1px solid rgba(0, 246, 255, 0.15);
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &.is-success {
    border-color: rgba(0, 255, 136, 0.5);
  }

  &.is-error {
    border-color: rgba(255, 80, 80, 0.5);
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;

  .file-icon {
    font-size: 20px;
    color: #00c8ff;
    flex-shrink: 0;
  }

  .file-name {
    font-size: 14px;
    color: rgba(0, 200, 255, 0.85);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .file-size {
    font-size: 12px;
    color: rgba(0, 200, 255, 0.5);
    flex-shrink: 0;
  }
}

.file-status {
  display: flex;
  align-items: center;
  gap: 8px;

  .progress-bar {
    width: 100px;
    height: 6px;
    background: rgba(0, 246, 255, 0.15);
    border-radius: 3px;
    overflow: hidden;

    .progress-inner {
      height: 100%;
      background: linear-gradient(90deg, #00b0f0, #00ff88);
      transition: width 0.3s ease;
    }
  }

  .status-icon {
    font-size: 18px;

    &.success {
      color: #00ff88;
    }

    &.error {
      color: #ff5050;
    }
  }

  .remove-btn {
    font-size: 16px;
    color: rgba(255, 80, 80, 0.6);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: rgba(255, 80, 80, 0.9);
    }
  }
}
</style>
