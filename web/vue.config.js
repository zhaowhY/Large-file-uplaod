// eslint-disable-next-line
const path = require('path');

const { env: { BASE_URL }, VUE_CLI_SERVICE: { mode } } = process;
const resolve = dir => path.join(__dirname, dir);

module.exports = {
  // 修改为相对路径
  publicPath: BASE_URL,
  devServer: {
    overlay: {
      warnings: false,
      errors: true
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('variable', resolve('src/theme/variable.scss'));

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();
  },


  productionSourceMap: mode !== 'production',
};
