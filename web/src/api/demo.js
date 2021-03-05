/** 使用示例
 * import adapter from '@/api';
 * adapter.getMessage();
 * adapter.postData({ type: 'array' });
 */

import { BASE_URL } from '@/config';

import { apiDecorator } from './adapter';

const adapter = apiDecorator(BASE_URL, [
  /** 上传文件切片 */
  {
    name: 'upload',
    method: 'post',
    url: '/filesChunk'
  },

  /** 获取已经上传文件切片 */
  {
    name: 'getFileChunk',
    method: 'get',
    url: '/filesChunk/{id}'
  },

  /** 文件上传完成 */
  {
    name: 'uploadSuccess',
    method: 'post',
    url: '/files/success'
  }
]);

export default adapter;
