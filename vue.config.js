module.exports = {
  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {},
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
        @import '@/assets/color-variables.scss';
        `,
      },
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/d3-heatmap-build/' : '/',
};
