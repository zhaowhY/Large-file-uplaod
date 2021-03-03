import Vue from 'vue';
import Router from 'vue-router';
// router lazy load
Vue.use(Router);
const route = new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('../views/Index.vue'),
      hidden: true
    }
  ]
});

export default route;
