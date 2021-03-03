import { demo } from './adapter';


export default {
  // 上传文件切片
  upload: (data, options) => demo.post('/filesChunk', data, options),

  // 获取已经上传文件切片
  getFileChunk: ({ id }) => demo.get(`/filesChunk/${id}`),

  // 文件上传完成
  uploadSuccess: data => demo.post('/files/success', data),
};
