import Vue from 'vue';
import '@/plugins/logger';
import '@/theme/index.scss';
// 以下不需要的时候可以注释掉
// import { DEBUG } from '@/config';
import '@/assets/icons';
import '@/plugins/element.js';
import router from '@/router';
import store from '@/store';

import App from './App.vue';

// eslint-disable-next-line
// if (DEBUG) import('./mock');

Vue.config.productionTip = false;

Vue.$log.info('vue-eslint launch...');
new Vue({
  router,
  store,
  render(h) { return h(App); },
  mounted() {
  }
}).$mount('#app');
