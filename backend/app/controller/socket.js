'use strict';

const Controller = require('egg').Controller;

class SocketController extends Controller {
  async index() {
    // 渲染websocket demo的home.html页面
    await this.ctx.render('home');
  }
}

module.exports = SocketController;
