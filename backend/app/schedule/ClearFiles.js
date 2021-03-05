'use strict';

const Subscription = require('egg').Subscription;
const fs = require('fs-extra');
const path = require('path');

// 定时清除public/files下文件
class ClearFiles extends Subscription {
  static get schedule() {
    return {
      cron: '0 0 12 * * *',
      type: 'all',
    };
  }

  async subscribe() {
    fs.emptyDirSync(path.join(
      process.cwd(),
      '/app/public/files/'
    ));
    console.log(new Date());
  }
}

module.exports = ClearFiles;
