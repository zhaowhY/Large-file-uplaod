'use strict';
// 邮件服务
const Controller = require('egg').Controller;

class EmailController extends Controller {
  // 访问 http://127.0.0.1:7002/email 即会执行该函数，发送邮件
  async index() {
    const { ctx, app } = this;
    try {
      const mailOptions = {
        from: '932907376@qq.com',
        to: '932907376@qq.com',
        subject: '标题',
        html: `内容: 生日快乐`
    };
     
    app.email.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log('邮件发送失败:', error);
        } else {
            console.log('邮件发送成功:' + response.message);
        }
        app.email.close();
    });
     
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: -2,
        data: '发送失败',
      };
    }
  }

}

module.exports = EmailController;
