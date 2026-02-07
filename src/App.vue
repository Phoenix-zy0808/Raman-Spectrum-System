<template>
  <div class="app">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.app {
  width: 100vw;
  height: 100vh;
  background-color: #020308;
  overflow: hidden;
}
</style>

<!-- 全局样式 - 不要加 scoped -->
<style lang="scss">
// Element Plus 下拉框全局样式覆盖
.el-select-dropdown {
  background-color: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3) !important;
}

.el-select-dropdown__item {
  color: #00e5ff !important;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(0, 229, 255, 0.2) !important;
    color: #00ff7f !important;
  }

  &.selected {
    background-color: rgba(0, 255, 127, 0.2) !important;
    color: #00ff7f !important;
    font-weight: bold;
  }
}

.el-popper__arrow::before {
  background: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
}

// Input Number 下拉框
.el-input-number__decrease,
.el-input-number__increase {
  background-color: rgba(0, 229, 255, 0.1) !important;
  border-color: rgba(0, 229, 255, 0.3) !important;
  color: #00e5ff !important;

  &:hover {
    background-color: rgba(0, 229, 255, 0.2) !important;
    color: #00ff7f !important;
  }
}

// Tooltip 提示框样式
.el-tooltip__popper {
  background-color: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;
  color: #00e5ff !important;
}

.el-popper.is-dark {
  background: rgba(0, 21, 41, 0.95) !important;
  border: 1px solid rgba(0, 229, 255, 0.5) !important;

  .el-popper__arrow::before {
    background: rgba(0, 21, 41, 0.95) !important;
    border: 1px solid rgba(0, 229, 255, 0.5) !important;
  }
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 229, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 229, 255, 0.5);
  }
}

::-webkit-scrollbar-thumb:active {
  background: #00e5ff;
}
</style>