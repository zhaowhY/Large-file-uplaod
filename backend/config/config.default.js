/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1570367216778_7082';

  exports.security = {
    csrf: false,
  };

  config.cors = {
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    origin: ctx => ctx.get('origin'),
  };

  // add your middleware config here
  config.middleware = [];


  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  const multipart = {
    fileExtensions: [ '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.csv', '.rar', '.zip', '.xlsx', '.xls', '' ],
    // 增加对 json 扩展名的文件支持
    fileSize: '200mb',
    fieldSize: '200mb',
  };
  return {
    ...config,
    ...userConfig,
    multipart,
    static: {
      prefix: '/',
      dir: [ 'app/public', 'app/public/web' ],
    },
  };
};
