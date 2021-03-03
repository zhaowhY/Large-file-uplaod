'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 文件上传
  router.post('/filesChunk', controller.file.upload);
  // 文件上传完成
  router.post('/files/success', controller.file.success);
  // 获取已成功上传的切片
  router.get('/filesChunk/:id', controller.file.getDirFiles);

};
