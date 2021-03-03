module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-px2rem-exclude': {
      // 基准大小 baseSize，需要和rem.js中相同
      // 1rem=remUnit*px
      remUnit: 100,
      exclude: /src|node_modules/i
      // exclude: /src\/views\/login.vue/i
    }
  }
}