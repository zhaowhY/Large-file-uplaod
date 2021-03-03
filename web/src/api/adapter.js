/**
 * axios
 * api: https://github.com/axios/axios
 */

import axios from 'axios';
import { domains } from '@/config';

const getInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    withCredentials: true,
  });
  instance.interceptors.response.use((response = {}) => {
    const { data: { code, data } } = response;
    if (code === 200) {
      return data;
    }
    return Promise.reject(response.data);
  }, error => Promise.reject(error));
  return instance;
};

export const demo = getInstance(domains.demo);

/**
 * TODO: 在实际项目中，考虑是否要采用第二种
 * 关于return Promise.reject(response.data),或者弹出框提示错误
 * 1. return Promise.reject(response.data)  不catch (error)，会阻塞函数中的代码继续运行
 * 2. 弹出框提示错误，不return 错误  可以统一处理错误，方便修改，不阻塞代码的运行
 */
