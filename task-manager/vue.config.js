const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/task-manager/' : '/',
  outputDir: 'dist',
  transpileDependencies: true
})
