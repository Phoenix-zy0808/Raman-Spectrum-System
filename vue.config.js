const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

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
  }
})