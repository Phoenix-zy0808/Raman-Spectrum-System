const { defineConfig } = require('@vue/cli-service')
const dotenv = require('dotenv')
const path = require('path')

// 加载环境变量文件
function loadEnv(envPath) {
  try {
    const envConfig = dotenv.config({ path: envPath })
    return envConfig.parsed || {}
  } catch (error) {
    console.warn(`Failed to load env from ${envPath}:`, error)
    return {}
  }
}

// 根据环境加载对应的 .env 文件
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development'

const env = loadEnv(path.resolve(__dirname, envFile))

// 将环境变量注入 process.env（Vue CLI 需要 VUE_APP_ 前缀）
Object.keys(env).forEach(key => {
  const prefixedKey = key.startsWith('VUE_APP_') ? key : `VUE_APP_${key}`
  process.env[prefixedKey] = env[key]
})

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

  // 配置公共路径
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

  devServer: {
    allowedHosts: 'all',
    client: {
      overlay: false
    },
    port: parseInt(env.PORT) || 8080,
    // 配置代理，解决跨域问题
    proxy: {
      '/api': {
        target: env.VUE_APP_API_BASE_URL || 'https://7fbb9b16.r28.cpolar.top',
        changeOrigin: true,
        secure: false,
        ws: true, // 支持 WebSocket
      },
    },
  },

  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      if (args[0].patterns && args[0].patterns[0].globOptions) {
        const ignore = args[0].patterns[0].globOptions.ignore || []
        if (!ignore.includes('**/index.html')) {
          ignore.push('**/index.html')
        }
        args[0].patterns[0].globOptions.ignore = ignore
      }
      return args
    })
  },

  // 配置 CSS
  css: {
    loaderOptions: {
      scss: {
        additionalData: '', // 如果需要全局 SCSS 变量，在这里添加
      },
    },
  },

  // 配置 Webpack
  configureWebpack: {
    // 性能提示
    performance: {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  },
})