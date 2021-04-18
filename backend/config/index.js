'use strict';

let severBaseUrl = 'http://127.0.0.1:7003';

switch (process.env.NODE_ENV) {
  case 'production':
    severBaseUrl = '';
    break;

  default:
    break;
}

exports.severBaseUrl = severBaseUrl;
