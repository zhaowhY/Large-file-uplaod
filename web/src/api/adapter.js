/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/**
 * axios
 * api: https://github.com/axios/axios
 */

import axios from 'axios';

const formatResponse = (options = {}) => (response = {}) => {
  const { data: { code, data }, data: rawData } = response;
  if (options.raw) {
    return rawData;
  }
  if (code === 200) {
    return data;
  }
  return Promise.reject(response.data);
};

const getInstance = (baseURL) => {
  const option = {
    baseURL,
    timeout: 30000,
    withCredentials: true,
  };

  const instance = axios.create(option);
  instance.interceptors.response.use(
    formatResponse(),
    error => Promise.reject(error)
  );

  // 原始输出，不需要处理返回值
  instance.raw = axios.create(option);
  instance.raw.interceptors.response.use(
    formatResponse({ raw: true }),
    error => Promise.reject(error)
  );

  return instance;
};

export const apiDecorator = (baseURL, apiLists, extraOptions = {}) => {
  let instance = getInstance(baseURL, extraOptions);
  if (extraOptions.raw) instance = instance.raw; // 输出原始值
  const adapter = {};
  apiLists.forEach(({ name, method, url }) => {
    adapter[name] = (opts = {}, extraOpts) => {
      const options = {};
      if (String.prototype.toLowerCase.call(method) === 'get') {
        options.params = opts;
      } else {
        options.data = opts;
      }
      return instance({
        url: isREST(url) ? convertRESTAPI(url, opts) : url,
        method,
        ...options,
        ...extraOpts
      });
    };
  });
  return adapter;
};

const isREST = url => /(:|{|})/.test(url);

const convertRESTAPI = (url, opts = {}) => {
  if (!opts) return url;

  const pathKeys = Object.keys(opts);

  pathKeys.forEach((key) => {
    const reg = new RegExp(`(:${key}|{${key}})`, 'g');
    url = url.replace(reg, opts[key]);
    delete opts[key];
  });

  return url;
};
