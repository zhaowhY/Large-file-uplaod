import Vue from 'vue';
import SvgIcon from '@/components/SvgIcon';

Vue.component('svg-icon', SvgIcon);

const req = require.context('./svg', false, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);

// 使用示例
// icon-class 为 icon 的名字; class-name 为 icon 自定义 class
// <svg-icon icon-class="password"  class-name='custom-class' />
