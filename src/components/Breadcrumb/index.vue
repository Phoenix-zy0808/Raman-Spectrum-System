<template>
  <div class="breadcrumb-nav">
    <div class="breadcrumb-content">
      <!-- 面包屑项 -->
      <template v-for="(item, index) in items" :key="index">
        <div class="breadcrumb-item" :class="{ active: index === items.length - 1 }">
          <span v-if="index > 0" class="breadcrumb-separator">
            <el-icon><ArrowRight /></el-icon>
          </span>
          <span
            v-if="index < items.length - 1"
            class="breadcrumb-link"
            @click="handleClick(item, index)"
          >
            <el-icon v-if="item.icon" class="item-icon">
              <component :is="item.icon" />
            </el-icon>
            {{ item.title }}
          </span>
          <span v-else class="breadcrumb-current">
            <el-icon v-if="item.icon" class="item-icon">
              <component :is="item.icon" />
            </el-icon>
            {{ item.title }}
          </span>
        </div>
      </template>
    </div>

    <!-- 页面标题 -->
    <div v-if="showTitle && currentPageTitle" class="page-title">
      <h2>{{ currentPageTitle }}</h2>
      <p v-if="currentPageDesc" class="page-desc">{{ currentPageDesc }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Home, Document, DataAnalysis, Setting, Monitor } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

// ─────────────────────── Props ───────────────────────
interface BreadcrumbItem {
  title: string
  path?: string
  icon?: any
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  showTitle?: boolean
  autoGenerate?: boolean
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  items: () => [],
  showTitle: true,
  autoGenerate: true,
})

// ─────────────────────── 路由 ───────────────────────
const route = useRoute()
const router = useRouter()

// ─────────────────────── 计算属性 ───────────────────────
const currentPageTitle = computed(() => {
  if (props.items.length > 0) {
    return props.items[props.items.length - 1].title
  }
  return route.meta.title as string || ''
})

const currentPageDesc = computed(() => {
  return route.meta.description as string || ''
})

// 自动生成面包屑
const autoItems = computed<BreadcrumbItem[]>(() => {
  if (!props.autoGenerate) return []

  const matched = route.matched.filter(m => m.path !== '*')
  const items: BreadcrumbItem[] = [
    { title: '首页', path: '/dashboard', icon: Home },
  ]

  for (const record of matched) {
    if (record.path !== '' && record.path !== '/') {
      const title = record.meta.title as string || record.path
      const icon = getIconByPath(record.path)
      items.push({ title, path: record.path, icon })
    }
  }

  return items
})

const items = computed<BreadcrumbItem[]>(() => {
  if (props.items.length > 0) {
    return props.items
  }
  return autoItems.value
})

// ─────────────────────── 方法 ───────────────────────
const getIconByPath = (path: string) => {
  if (path.includes('analysis')) return DataAnalysis
  if (path.includes('data')) return Document
  if (path.includes('system')) return Setting
  if (path.includes('dashboard') || path.includes('index')) return Monitor
  return undefined
}

const handleClick = (item: BreadcrumbItem, index: number) => {
  if (item.path) {
    router.push(item.path)
  }
}

// ─────────────────────── 暴露接口 ───────────────────────
defineExpose({
  items,
})
</script>

<style scoped lang="scss">
.breadcrumb-nav {
  padding: 16px 20px;
  background: rgba(0, 21, 41, 0.8);
  border-bottom: 1px solid rgba(0, 246, 255, 0.15);
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;

  &.active {
    .breadcrumb-current {
      color: #00ff88;
      font-weight: 600;
    }
  }
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  color: rgba(0, 200, 255, 0.4);
  font-size: 12px;
  margin: 0 4px;
}

.breadcrumb-link {
  color: rgba(0, 200, 255, 0.75);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #00ff88;
  }

  .item-icon {
    font-size: 16px;
  }
}

.breadcrumb-current {
  color: rgba(0, 200, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 6px;

  .item-icon {
    font-size: 16px;
  }
}

.page-title {
  margin-top: 12px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #00ff88;
    margin: 0 0 4px 0;
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }

  .page-desc {
    font-size: 13px;
    color: rgba(0, 200, 255, 0.6);
    margin: 0;
  }
}
</style>
