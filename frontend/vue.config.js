const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: 'http://82.202.214.42:80/',
    // proxy: 'http://82.202.214.42:8899/',
    //  proxy: 'http://212.22.70.159:1337/',
    // proxy: 'http://localhost:8080/',
  },
})
